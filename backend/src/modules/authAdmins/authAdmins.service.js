import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import db from "../../db/connection.js";
import {
  getAdminByEmail,
  getAdminById,
  createAdmin
} from "../../db/models/admins.model.js";
import { createUser, getUserByEmail, getUserById, deleteUser } from "../../db/models/users.model.js";
import { createStoreAdminRegister, getAllStoreRequests, updateStoreRequestStatus, getStoreRequestByUserId, getStoreRequestById, deleteStoreRequest } from "../../db/models/storeAdminRegister.model.js";

// Register Mall Admin Request
export const registerMallAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingAdmin = await getAdminByEmail(email);
    const existingUser = await getUserByEmail(email);

    if (existingAdmin) {
      return res.status(409).json({ message: "Email already exists globally as Admin" });
    }

    let user;
    if (!existingUser) {
      user = await createUser({
        name,
        email: String(email).trim().toLowerCase(),
        password,
        gender: 'not_specified',
        userCode: `MA_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
    } else {
      user = existingUser;
    }

    let commercial_license = null;
    let identification_document = null;

    if (req.files) {
      if (req.files['commercial_license'] && req.files['commercial_license'].length > 0) {
        commercial_license = req.files['commercial_license'][0].path.replace(/\\/g, '/');
      }
      if (req.files['identification_document'] && req.files['identification_document'].length > 0) {
        identification_document = req.files['identification_document'][0].path.replace(/\\/g, '/');
      }
    }

    // Using the mall_admin_register table
    const { createMallAdminRegister } = await import("../../db/models/mallAdminRegister.model.js");
    const mallRequest = await createMallAdminRegister({
      user_id: user.id,
      commercial_license,
      identification_document
    });

    return res.status(201).json({
      message: "Mall Registration Request submitted. Awaiting System Admin approval.",
      request: mallRequest
    });

  } catch (err) {
    next(err);
  }
};

// Store Admin Register Request
export const registerStoreAdmin = async (req, res, next) => {
  try {
    const { name, email, password, mall_id } = req.body;

    if (!name || !email || !password || !mall_id) {
      return res.status(400).json({ message: "Name, email, password, and mall_id are required" });
    }

    const existingAdmin = await getAdminByEmail(email);
    const existingUser = await getUserByEmail(email);

    if (existingAdmin) {
      return res.status(409).json({ message: "Email already exists globally as Admin" });
    }

    let user;
    if (!existingUser) {
      user = await createUser({
        name,
        email: String(email).trim().toLowerCase(),
        password,
        gender: 'not_specified',
        userCode: `SA_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
    } else {
      user = existingUser;
    }

    let commercial_license = null;
    let identification_document = null;

    if (req.files) {
      if (req.files['commercial_license'] && req.files['commercial_license'].length > 0) {
        commercial_license = req.files['commercial_license'][0].path.replace(/\\/g, '/');
      }
      if (req.files['identification_document'] && req.files['identification_document'].length > 0) {
        identification_document = req.files['identification_document'][0].path.replace(/\\/g, '/');
      }
    }

    // 3. Create the Store entity immediately (pending)
    const { createStore } = await import("../../db/models/store.model.js");
    const store = await createStore({
      store_name: name, // Using admin name as store name
      user_id: user.id,
      image_url: null
    });

    // 4. Link the store to the selected mall in store_mall table as 'pending'
    const { linkStoreToMall } = await import("../../db/models/storeMall.model.js");
    await linkStoreToMall({
      store_id: store.id,
      mall_id: mall_id,
      status: 'pending'
    });

    // 5. Create the registration request record (now only tracks the account status)
    const storeRequest = await createStoreAdminRegister({
      user_id: user.id,
      commercial_license,
      identification_document
    });

    return res.status(201).json({
      message: "Store Registration Request submitted. Awaiting Mall Admin approval.",
      request: storeRequest
    });

  } catch (err) {
    next(err);
  }
};

export const getAllStoreRequestsAdmin = async (req, res, next) => {
  try {
    const { search, mall_id, admin_user_id } = req.query;

    // If admin_user_id provided, look up their mall automatically
    let resolvedMallId = mall_id || null;
    if (!resolvedMallId && admin_user_id) {
        const [malls] = await db.query('SELECT mall_id FROM mall WHERE user_id = ?', [admin_user_id]);
        if (malls.length > 0) resolvedMallId = malls.map(m => m.mall_id);
    }

    const requests = await getAllStoreRequests(search, resolvedMallId);
    return res.json({ requests });
  } catch (err) {
    next(err);
  }
};

export const approveStoreRequestAdmin = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // 1. Get the request to find the user
    const request = await getStoreRequestById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const user = await getUserById(request.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Authorization Check: Mall Admins can only approve requests for their own malls
    if (req.admin.role !== 'system_admin') {
        const [malls] = await db.query("SELECT mall_id FROM mall WHERE user_id = ?", [req.admin.id]);
        const mallIds = malls.map(m => m.mall_id);
        
        const [assignment] = await db.query(`
            SELECT sm.mall_id 
            FROM store_mall sm 
            JOIN store s ON sm.store_id = s.store_id 
            WHERE s.user_id = ? AND sm.status = 'pending'
        `, [request.user_id]);

        if (!assignment.length || !mallIds.includes(assignment[0].mall_id)) {
            return res.status(403).json({ message: "You are not authorized to approve this request." });
        }
    }

    const inviteCode = user.user_code; // Use user_code as the invite code

    // 3. Update request status to approved and store the invite code
    await db.execute(
        "UPDATE store_admin_register SET status = 'approved', invite_code = ? WHERE store_register_id = ?",
        [inviteCode, id]
    );

    // 3. Approve the pending store_mall assignment
    // Find the store owned by this user
    const [stores] = await db.query("SELECT store_id FROM store WHERE user_id = ?", [request.user_id]);
    if (stores.length > 0) {
        const storeId = stores[0].store_id;
        // Update all pending assignments for this store to 'approved'
        await db.execute("UPDATE store_mall SET status = 'approved' WHERE store_id = ? AND status = 'pending'", [storeId]);
    }

    // 4. Send Approval Email
    console.log("Connecting to Gmail SMTP for Store Approval...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ahmedmohamedhany1234567@gmail.com",
        pass: "pxtgiubnhiuoemvt",
      },
    });

    await transporter.sendMail({
      from: '"Mallify Admin" <ahmedmohamedhany1234567@gmail.com>',
      to: user.email,
      subject: "Your Mallify Store Request has been Approved!",
      html: `<h3>Dear ${user.name},</h3>
             <p>Congratulations! Your store registration request for <b>${user.name}</b> has been approved.</p>
             <p>Your Admin ID / Invite Code is: <b style="color: #0ea5e9; font-family: monospace; font-size: 1.2em; letter-spacing: 2px;">${inviteCode}</b><br>
             Use your email and password to log in to the Mallify Web Dashboard.</p>
             <p>Kind regards,<br>The Mallify Team</p>`,
    });

    return res.json({ message: "Store approved and email sent." });
  } catch (err) {
    next(err);
  }
};

export const rejectStoreRequestAdmin = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { user_id, reason } = req.body;

    // 1. Fetch the request to get the user_id
    const request = await getStoreRequestById(id);
    if (!request) return res.status(404).json({ message: "Store request not found" });

    // 2. Authorization Check: Mall Admins can only reject requests for their own malls
    if (req.admin.role !== 'system_admin') {
        const [malls] = await db.query("SELECT mall_id FROM mall WHERE user_id = ?", [req.admin.id]);
        const mallIds = malls.map(m => m.mall_id);
        
        const [assignment] = await db.query(`
            SELECT sm.mall_id 
            FROM store_mall sm 
            JOIN store s ON sm.store_id = s.store_id 
            WHERE s.user_id = ? AND sm.status = 'pending'
        `, [request.user_id]);

        if (!assignment.length || !mallIds.includes(assignment[0].mall_id)) {
            return res.status(403).json({ message: "You are not authorized to reject this request." });
        }
    }

    // 3. Fetch the user to get their email
    const user = await getUserById(request.user_id);
    if (!user) {
      // If user is missing, just delete the request
      await deleteStoreRequest(id);
      return res.json({ message: "Request deleted (User was already missing)." });
    }

    // 3. Send Rejection Email
    console.log("Sending rejection email to:", user.email);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ahmedmohamedhany1234567@gmail.com",
        pass: "pxtgiubnhiuoemvt",
      },
    });

    await transporter.sendMail({
      from: '"Mallify Admin" <ahmedmohamedhany1234567@gmail.com>',
      to: user.email,
      subject: "Mallify Store Request - Rejected",
      html: `<h3>Dear ${user.name},</h3>
             <p>Thank you for your interest in Mallify and for submitting your application.</p>
             <p>Unfortunately, we regret to inform you that your store registration and commercial license request have not been approved at this time.</p>
             <p>This decision may be due to incomplete or insufficient documentation. We encourage you to review your submission and ensure that all required information is accurately provided.</p>
             <p>Should you have any questions or wish to reapply with updated documentation, please do not hesitate to contact our support team.<p>
             <p>We appreciate your interest in partnering with Mallify and look forward to the possibility of working with you in the future.<p>
             <p>Kind regards,<br>The Mallify Team</p>`,
    });

    // 4. Cleanup: Delete User, Store, Mall Assignment and store request
    const { deleteUser } = await import("../../db/models/users.model.js");
    
    // Find store_id
    const [stores] = await db.query("SELECT store_id FROM store WHERE user_id = ?", [request.user_id]);
    if (stores.length > 0) {
        const storeId = stores[0].store_id;
        await db.execute("DELETE FROM store_mall WHERE store_id = ?", [storeId]);
        await db.execute("DELETE FROM store WHERE store_id = ?", [storeId]);
    }

    await deleteUser(request.user_id);
    await deleteStoreRequest(id);

    return res.json({ message: "Request rejected, email sent, and records removed." });
  } catch (err) {
    next(err);
  }
};

export const verifyMallCode = async (req, res, next) => {
  try {
    const { email, inviteCode } = req.body;

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { getMallRequestByUserId } = await import("../../db/models/mallAdminRegister.model.js");
    const request = await getMallRequestByUserId(user.id);
    if (!request || request.status !== 'approved') return res.status(400).json({ message: "No approved requests found for this user." });

    if (request.invite_code !== inviteCode) return res.status(400).json({ message: "Invalid Verification Code" });

    // Upgrade to Mall Admin
    const admin = await createAdmin({
      name: user.name,
      email: user.email,
      password: user.password,
      admin_type: 'mall'
    });

    // Create the Mall entity using the admin's name
    const { createMall } = await import("../../db/models/mall.model.js");
    await createMall({
        mall_name: user.name, // The user's name is the mall's name
        user_id: user.id,
        image_url: null
    });

    return res.json({ message: "Mall Admin Account activated successfully", admin });
  } catch (err) {
    next(err);
  }
};

export const verifyStoreCode = async (req, res, next) => {
  try {
    const { email, inviteCode } = req.body;

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const request = await getStoreRequestByUserId(user.id);
    
    if (!request || request.status !== 'approved') return res.status(400).json({ message: "No approved requests found for this user." });

    if (request.invite_code !== inviteCode) {
        return res.status(400).json({ message: "Invalid Verification Code" });
    }

    const admin = await createAdmin({
      name: user.name,
      email: user.email,
      password: user.password,
      admin_type: 'store'
    });

    // The Store and StoreMall records were already created at registration.
    // They are currently in 'pending' status in store_mall (managed by the request approval).
    // Once the admin account is activated here, they are officially ready to log in.

    return res.json({ message: "Store Admin Account activated successfully", admin });
  } catch (err) {
    next(err);
  }
};

// admin login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // 1. Try to find an existing admin
    let admin = await getAdminByEmail(email);
    
    // 2. If not found, check if it's a regular user with an approved request
    if (!admin) {
        const { getUserByEmail } = await import("../../db/models/users.model.js");
        const user = await getUserByEmail(email);
        
        if (user && user.password === password) {
            // Check Mall requests
            const { getMallRequestByUserId } = await import("../../db/models/mallAdminRegister.model.js");
            const mallReq = await getMallRequestByUserId(user.id);
            if (mallReq) {
                if (mallReq.status === 'approved') {
                    return res.json({ ok: true, requiresActivation: true, type: 'mall', email: user.email });
                } else if (mallReq.status === 'pending') {
                    return res.json({ ok: true, requiresWait: true, type: 'mall' });
                }
            }
            
            // Check Store requests
            const { getStoreRequestByUserId } = await import("../../db/models/storeAdminRegister.model.js");
            const storeReq = await getStoreRequestByUserId(user.id);
            if (storeReq) {
                if (storeReq.status === 'approved') {
                    return res.json({ ok: true, requiresActivation: true, type: 'store', email: user.email });
                } else if (storeReq.status === 'pending') {
                    return res.json({ ok: true, requiresWait: true, type: 'store' });
                }
            }
        }
    }

    if (!admin || admin.password !== password)
      return res.status(401).json({ message: "Invalid email or password" });

    // generate JWT token for all admins
    const token = jwt.sign(
      { id: admin.id, admin_type: admin.admin_type, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message:
        admin.role === "system_admin" 
          ? "System admin login successful" 
          : admin.admin_type === "mall"
          ? "Mall admin login successful"
          : "Store admin login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        admin_type: admin.admin_type,
        role: admin.role,
        user_code: admin.user_code
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// get admin info (me)
export const meAdmin = async (req, res, next) => {
  try {
    const id = req.params.id;
    const admin = await getAdminById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.json({
      admin: { id: admin.id, name: admin.name, email: admin.email, admin_type: admin.admin_type, role: admin.role, user_code: admin.user_code }
    });

  } catch (err) {
    next(err);
  }
};
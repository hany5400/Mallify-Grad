import db from '../connection.js';

const Admin = (row) => {
  if (!row) return null;
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    password: row.password,
    user_code: row.user_code,
    role: row.role,
    admin_type: row.role === 'mall_admin' ? 'mall' : (row.role === 'system_admin' ? 'system' : 'store')
  };
};

/**
 * Helper to generate next sequential code based on prefix
 */
const generateAdminCode = async (prefix) => {
    const [rows] = await db.query("SELECT user_code FROM users WHERE user_code LIKE ? ORDER BY user_code DESC LIMIT 1", [`${prefix}%`]);
    if (rows.length === 0) return `${prefix}001`;
    
    const lastCode = rows[0].user_code;
    const lastNum = parseInt(lastCode.replace(prefix, ''));
    const nextNum = (lastNum + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
};

/**
 * REFACTORED: Now queries the `users` table since `admins` table was dropped.
 * Maps 'mall_admin' to 'mall' and 'store_admin' to 'store' for backward compatibility.
 */

// create admin (Now an update to a user's role)
export const createAdmin = async (data) => {
  const { name, email, password, admin_type } = data;
  const role = admin_type === 'mall' ? 'mall_admin' : 'store_admin';
  
  // Try to find existing user or return error
  const [existing] = await db.query('SELECT user_id, user_code FROM users WHERE email = ?', [email]);
  const prefix = admin_type === 'mall' ? 'ADM' : 'SAD';

  if (existing.length > 0) {
    const userId = existing[0].user_id;
    const currentCode = existing[0].user_code;
    
    // Assign specific code if they don't have one matching the new role
    if (!currentCode || !currentCode.startsWith(prefix)) {
        const newCode = await generateAdminCode(prefix);
        await db.query('UPDATE users SET role = ?, user_code = ? WHERE user_id = ?', [role, newCode, userId]);
    } else {
        await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, userId]);
    }
    
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return Admin(rows[0]);
  }
  
  // Create new user with specific code
  const adminCode = await generateAdminCode(prefix);
  const query = `INSERT INTO users (name, email, password, role, user_code, gender) VALUES (?,?,?,?,?, 'not_specified')`;
  const [result] = await db.execute(query, [name, email, password, role, adminCode]);
  const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
  return Admin(rows[0]);
};

// get all admins
export const getAllAdmins = async () => {
  const [rows] = await db.query("SELECT * FROM users WHERE role IN ('store_admin', 'mall_admin', 'system_admin')");
  return rows.map(Admin);
};

// get admin by id
export const getAdminById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE user_id = ? AND role IN ('store_admin', 'mall_admin', 'system_admin')", [id]);
  return Admin(rows[0]);
};

// get admin by email
export const getAdminByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND role IN ('store_admin', 'mall_admin', 'system_admin')", [email]);
  return Admin(rows[0]);
};

// get admins by filter
export const getAdminsByFilter = async (keyword, keyvalue, search = null) => {
  const fieldMap = {
    'admin_id': 'user_id',
    'name': 'name',
    'email': 'email',
    'admin_type': 'role'
  };

  const field = fieldMap[keyword] || keyword;
  let queryValue = `%${keyvalue}%`;
  let operator = 'LIKE';

  if (keyword === 'admin_type') {
    queryValue = keyvalue === 'mall' ? 'mall_admin' : 'store_admin';
    operator = '=';
  }

  let query = `SELECT * FROM users WHERE ${field} ${operator} ? AND role IN ('store_admin', 'mall_admin', 'system_admin')`;
  const params = [queryValue];

  if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR user_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [rows] = await db.query(query, params);

  return rows.map(Admin);
};

// update admin
export const updateAdmin = async (id, data) => {
  const { name, email, password, admin_type } = data;
  const role = admin_type === 'mall' ? 'mall_admin' : 'store_admin';
  
  await db.query(
    'UPDATE users SET name=?, email=?, password=?, role=? WHERE user_id=?',
    [name, email, password, role, id]
  );
  const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  return Admin(rows[0]);
};

// delete admin (Downgrade to 'user' or delete?)
// The user said "admins" table is dropped, and they added roles to "users".
// Deleting an admin now probably means downgrading them or deleting the user. 
// Given the user flow, deleting the user or setting role to 'user' is safer.
export const deleteAdmin = async (id) => {
  const [result] = await db.query('DELETE FROM users WHERE user_id=?', [id]);
  return result;
};
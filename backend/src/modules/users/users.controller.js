import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUsersByFilter,
  searchUsers,
  changePassword 
} from './users.service.js';
import { authenticateUser } from './middleWaresUsers/authenticateUser.js';

const router = express.Router();

// Multer Config for Avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// --- PUBLIC/ADMIN ROUTES ---

// get all users or by keyword
router.get('/', async (req, res) => {
  try {
    const { id, keyword, keyvalue, search } = req.query;

    if (id) {
      const user = await getUserById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    }

    if (search) {
      const users = await searchUsers(search);
      return res.json(users);
    }

    if (keyword && keyvalue) {
      if (keyword === 'user_id') {
        const user = await getUserById(keyvalue);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json(user);
      } else {
        const users = await getUsersByFilter(keyword, keyvalue);
        return res.json(users);
      }
    }

    const users = await getAllUsers();
    res.json(users);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROFILE ROUTES (Requires Auth) ---

// Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  res.json({ ok: true, data: req.user });
});

// Update profile info (name, gender, DOB)
router.patch('/update-profile', authenticateUser, async (req, res) => {
  try {
    const result = await updateUser(req.user.id, req.body);
    res.json({ ok: true, message: 'Profile updated successfully', result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Upload/Update Avatar
router.patch('/avatar', authenticateUser, upload.single('avatar'), async (req, res) => {
  try {

    
    if (!req.file) {

      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }
    
    // Construct the path manually like in store controller to ensure it's relative
    const avatarUrl = `uploads/avatars/${req.file.filename}`;


    // Delete old avatar from disk if it exists
    if (req.user.avatar) {
      const oldFilePath = path.join(process.cwd(), req.user.avatar.replace(/\//g, path.sep));
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);

        } catch (unlinkErr) {
          console.error(`[USER] Error deleting old avatar: ${unlinkErr.message}`);
        }
      }
    }

    const result = await updateUser(req.user.id, { avatar: avatarUrl });

    
    res.json({ ok: true, message: 'Avatar updated successfully', avatar: avatarUrl, result });
  } catch (error) {
    console.error(`[USER] Avatar upload error: ${error.message}`);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Delete Avatar
router.delete('/avatar', authenticateUser, async (req, res) => {
  try {
    // Optionally delete the file from disk if it exists
    if (req.user.avatar) {
      const filePath = path.join(process.cwd(), req.user.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const result = await updateUser(req.user.id, { avatar: null });
    res.json({ ok: true, message: 'Avatar removed successfully', result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Change Password
router.patch('/change-password', authenticateUser, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ ok: false, message: 'New password is required' });
    }
    
    await changePassword(req.user.id, newPassword);
    res.json({ ok: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// --- GENERIC CRUD ---

// get only one user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete user
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
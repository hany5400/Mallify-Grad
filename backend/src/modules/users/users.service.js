import db from '../../db/connection.js';
import {
  createUser as createUserModel,
  getAllUsers as getAllUsersModel,
  getUserById as getUserByIdModel,
  updateUser as updateUserModel,
  deleteUser as deleteUserModel,
  getUsersByFilter as getUsersByFilterModel
} from '../../db/models/users.model.js';

const User = (row) => {
  if (!row) return null;
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    password: row.password,
    gender: row.gender,
    DOB: row.DOB,
    points: row.points,
    user_code: row.user_code,
    avatar: row.avatar,
    role: row.role
  };
};

const allowedGenders = ["male", "female"];

// This avoids database schema changes and cleans itself automatically.
export const activeUsersStore = new Map();

export const markUserActive = (user) => {
  activeUsersStore.set(user.id, {
    id: user.id,
    name: user.name,
    email: user.email,
    lastActive: Date.now()
  });
};

export const getActiveUsers = (minutes = 15) => {
  const now = Date.now();
  const activeThreshold = minutes * 60 * 1000;
  const activeUsers = [];

  for (const [userId, userData] of activeUsersStore.entries()) {
    if (now - userData.lastActive <= activeThreshold) {
      activeUsers.push(userData);
    } else {
      // Clean up inactive users to free memory
      activeUsersStore.delete(userId);
    }
  }

  return activeUsers;
};

// create user
export const createUser = async (data) => {
  const { name, email, password, gender, DOB, userCode, points, avatar, role } = data;
  return await createUserModel({ name, password, gender, DOB, email, userCode, points, avatar, role });
};

// get all users
export const getAllUsers = async () => {
  return await getAllUsersModel();
}

// get user by (id)
export const getUserById = async (id) => {
  return await getUserByIdModel(id);
}

// get users by filter
export const getUsersByFilter = async (keyword, keyvalue) => {
  return await getUsersByFilterModel(keyword, keyvalue);
};

// search users
export const searchUsers = async (searchTerm) => {
  const query = `
    SELECT * FROM users 
    WHERE name LIKE ? OR email LIKE ? OR user_code LIKE ?
  `;
  const val = `%${searchTerm}%`;
  const [rows] = await db.query(query, [val, val, val]);
  return rows.map(User);
};

//get user code
export const getUserByCode = async (userCode) => {
  const [rows] = await db.query("SELECT * FROM users WHERE user_code = ?", [userCode]);
  return User(rows[0]) || null;
};

// update user
export const updateUser = async (id, data) => {
  const existingUser = await getUserByIdModel(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (data.gender) {
    if (allowedGenders.includes(data.gender.toLowerCase().trim())) {
      data.gender = data.gender.toLowerCase().trim();
    } else {
      throw new Error("Invalid gender. Allowed: male, female");
    }
  }

  const updatedData = {
    name: data.hasOwnProperty('name') ? data.name : existingUser.name,
    email: data.hasOwnProperty('email') ? data.email : existingUser.email,
    password: data.hasOwnProperty('password') ? data.password : existingUser.password,
    gender: data.hasOwnProperty('gender') ? data.gender : existingUser.gender,
    DOB: data.hasOwnProperty('DOB') ? data.DOB : existingUser.DOB,
    avatar: data.hasOwnProperty('avatar') ? data.avatar : existingUser.avatar,
    role: data.hasOwnProperty('role') ? data.role : existingUser.role
  };

  return await updateUserModel(id, updatedData);
};

// delete user
export const deleteUser = async (id) => {
  const user = await getUserByIdModel(id);
  if (user && user.role === 'system_admin') {
    throw new Error("System Administrators cannot be deleted for security reasons.");
  }
  return await deleteUserModel(id);
}

// change password
export const changePassword = async (id, newPassword) => {
  const user = await getUserByIdModel(id);
  if (!user) throw new Error("User not found");

  return await updateUserModel(id, { ...user, password: newPassword });
};
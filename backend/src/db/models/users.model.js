import db from '../connection.js';

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
}

// create user
export const createUser = async (data) => {
  const { name, password, gender, DOB = null, email, userCode, points = 0, avatar = null, role = 'user' } = data;

  const query = `INSERT INTO users (name, password, gender, DOB, email, user_code, points, avatar, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await db.execute(query, [name, password, gender, DOB, email, userCode, points, avatar, role]);
  const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
  return User(rows[0]);
}

// get users by filter
export const getUsersByFilter = async (keyword, keyvalue) => {
  const allowedFields = ['user_id', 'name', 'email', 'gender', 'user_code'];

  if (!allowedFields.includes(keyword)) {
    throw new Error('Invalid filter field');
  }

  const [rows] = await db.query(
    `SELECT * FROM users WHERE ${keyword} = ?`,
    [keyvalue]
  );

  return rows.map(User);
};

// get user by email
export const getUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return User(rows[0]) || null;
}

// read all users
export const getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM users');
  return rows.map(User);
}

// get count
export const getUserCount = async () => {
  const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
  return rows[0].count;
}

export const getUserCountByRole = async (role) => {
  const [rows] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', [role]);
  return rows[0].count;
}

// read only one user by id
export const getUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  return User(rows[0]);
}

// update user role
export const updateUserRole = async (id, role) => {
  const [result] = await db.query(
    'UPDATE users SET role=? WHERE user_id=?',
    [role, id]
  );
  return result.affectedRows > 0;
}

// update user
export const updateUser = async (id, data) => {
  const fields = [];
  const values = [];

  const allowedFields = ['name', 'email', 'gender', 'DOB', 'password', 'avatar', 'role', 'points', 'user_code'];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
    return User(rows[0]);
  }

  const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
  values.push(id);

  await db.execute(query, values);
  const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  return User(rows[0]);
}

// delete user
export const deleteUser = async (id) => {
  const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
  return result;
}
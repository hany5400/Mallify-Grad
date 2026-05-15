import db from '../connection.js';

const UserRequest = (row) => {
    if (!row) return null;
    return {
        request_id: row.request_id,
        user_id: row.user_id,    // fk
        budget: row.budget,
    };
};

// create user request
export const createUserRequest = async (data, connection = null) => {
    const { user_id, budget } = data;
    const dbConn = connection || db;
    const query = `INSERT INTO user_request (user_id, budget) VALUES (?, ?)`;
    const [result] = await dbConn.execute(query, [user_id, budget]);
    return { request_id: result.insertId, user_id, budget };
};

// get all user requests
export const getAllUserRequests = async () => {
    const [rows] = await db.query('SELECT * FROM user_request');
    return rows.map(UserRequest);
};

// get user request by id
export const getUserRequestById = async (id) => {
    const [rows] = await db.query('SELECT * FROM user_request WHERE request_id = ?', [id]);
    return UserRequest(rows[0]);
};

// get user requests by user id 3ashan el user yshof el request bta3o bas
export const getUserRequestsByUserId = async (userId) => {
    const [rows] = await db.query(
        'SELECT * FROM user_request WHERE user_id = ?',
        [userId]
    );
    return rows.map(UserRequest);
};

//get user requests by filter
export const getUserRequestByFilter = async (keyword, keyvalue) => {
    const allowedFields = ['user_id', 'budget', 'request_id'];

    if (!allowedFields.includes(keyword)) {
        throw new Error('Invalid filter field');
    }

    const [rows] = await db.query(
        `SELECT * FROM user_request WHERE ${keyword} = ?`,
        [keyvalue]
    );

    return rows.map(UserRequest);
};

// update user request
export const updateUserRequest = async (id, data) => {
    const { budget } = data;
    const [result] = await db.query('UPDATE user_request SET budget = ? WHERE request_id = ?', [budget, id]);
    const [rows] = await db.query('SELECT * FROM user_request WHERE request_id = ?', [id]);
    return UserRequest(rows[0]);
};

// delete user request
export const deleteUserRequest = async (id) => {
    const [result] = await db.query('DELETE FROM user_request WHERE request_id = ?', [id]);
    return result;
};
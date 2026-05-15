import db from '../connection.js';

const result = (row) => {
    if (!row) return null;
    return {
        id: row.result_id,
        total_price: row.total_price,
        request_id: row.request_id
    };
};

// create result
export const createResult = async (data, connection = null) => {
    const { request_id, total_price } = data;
    const dbConn = connection || db;
    const query = `INSERT INTO result (request_id, total_price) VALUES (?, ?)`;
    const [res] = await dbConn.execute(query, [request_id, total_price]);
    return { result_id: res.insertId, request_id, total_price };
};

// get all results
export const getAllResults = async () => {
    const [rows] = await db.query('SELECT * FROM result');
    return rows.map(result);
};

// get result by id
export const getResultById = async (id) => {
    const [rows] = await db.query('SELECT * FROM result WHERE result_id = ?', [id]);
    return result(rows[0]);
};

// get results by filter
export const getResultsByFilter = async (keyword, keyvalue) => {
    const allowedFields = ['result_id', 'request_id', 'total_price'];

    if (!allowedFields.includes(keyword)) {
        throw new Error('Invalid filter field');
    }

    const [rows] = await db.query(
        `SELECT * FROM result WHERE ${keyword} = ?`,
        [keyvalue]
    );

    return rows.map(result);
};

// update result
export const updateResult = async (id, data) => {
    const { total_price } = data;
    await db.execute('UPDATE result SET total_price=? WHERE result_id=?', [total_price, id]);
    const [rows] = await db.query('SELECT * FROM result WHERE result_id = ?', [id]);
    return result(rows[0]);
};

// delete result
export const deleteResult = async (id) => {
    const [res] = await db.query('DELETE FROM result WHERE result_id = ?', [id]);
    return res;
};
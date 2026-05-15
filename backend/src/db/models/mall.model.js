import db from '../connection.js';

const mall = (row) => {
    if (!row) return null;
    return {
        id: row.mall_id,
        mall_name: row.mall_name,
        user_id: row.user_id, //fk users table
        owner_name: row.owner_name || 'N/A',
        image_url: row.image_url
    };
}

// create mall
export const createMall = async (data) => {
    const { mall_name, user_id, image_url } = data;
    const query = `INSERT INTO mall (mall_name, user_id, image_url) VALUES(?,?,?)`;
    const [result] = await db.execute(query, [mall_name, user_id, image_url]);
    const [rows] = await db.query('SELECT * FROM mall WHERE mall_id = ?', [result.insertId]);
    return mall(rows[0]);
}


// get all malls
export const getAllMalls = async (userId = null) => {
    let query = 'SELECT mall.*, users.name as owner_name FROM mall LEFT JOIN users ON mall.user_id = users.user_id';
    const params = [];

    if (userId) {
        query += ' WHERE mall.user_id = ?';
        params.push(userId);
    }

    const [rows] = await db.query(query, params);
    return rows.map(mall);
}

// get count
export const getMallCount = async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM mall');
    return rows[0].count;
}

// get only one mall by id
export const getMallById = async (id) => {
    const query = 'SELECT mall.*, users.name as owner_name FROM mall LEFT JOIN users ON mall.user_id = users.user_id WHERE mall.mall_id = ?';
    const [rows] = await db.query(query, [id]);
    return mall(rows[0]);
}

// get mall by filter
export const getMallsByFilter = async (keyword, keyvalue) => {
    const fieldMap = {
        'mall_id': 'mall.mall_id',
        'mall_name': 'mall.mall_name',
        'user_id': 'mall.user_id'
    };

    const field = fieldMap[keyword] || keyword;

    const query = `
        SELECT mall.*, users.name as owner_name 
        FROM mall 
        LEFT JOIN users ON mall.user_id = users.user_id 
        WHERE ${field} LIKE ?
    `;

    const [rows] = await db.query(query, [`%${keyvalue}%`]);

    return rows.map(mall);
};

// update mall
export const updateMall = async (id, data) => {
    const fields = [];
    const values = [];

    if (data.mall_name !== undefined) {
        fields.push("mall_name = ?");
        values.push(data.mall_name);
    }
    if (data.user_id !== undefined) {
        fields.push("user_id = ?");
        values.push(data.user_id);
    }
    if (data.image_url !== undefined) {
        fields.push("image_url = ?");
        values.push(data.image_url);
    }

    if (fields.length === 0) {
        const [rows] = await db.query('SELECT * FROM mall WHERE mall_id = ?', [id]);
        return mall(rows[0]);
    }

    const query = `UPDATE mall SET ${fields.join(", ")} WHERE mall_id = ?`;
    values.push(id);



    await db.execute(query, values);
    const [rows] = await db.query('SELECT * FROM mall WHERE mall_id = ?', [id]);
    return mall(rows[0]);
};



// delete mall
export const deleteMall = async (id) => {
    const [result] = await db.query('DELETE FROM mall WHERE mall_id = ?', [id]);
    return result;
}


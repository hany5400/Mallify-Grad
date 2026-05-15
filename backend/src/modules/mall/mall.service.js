import {
    createMall as createMallModel,
    getAllMalls as getAllMallsModel,
    getMallById as getMallByIdModel,
    updateMall as updateMallModel,
    deleteMall as deleteMallModel,
    getMallsByFilter as getMallsByFilterModel
} from '../../db/models/mall.model.js';

import { getAdminById } from '../../db/models/admins.model.js';

//create mall
export const createMall = async (data) => {
    const { mall_name, user_id, image_url } = data;
    const admin = await getAdminById(user_id);
    if (!admin) throw new Error("Admin not found");
    if (admin.admin_type !== 'mall') throw new Error("Only the mall admin with the specific ID can create malls");

    // --- Hard Limit: One Mall per Admin ---
    const allMalls = await getAllMallsModel();
    const adminMalls = allMalls.filter(m => m.user_id === user_id);
    if (adminMalls.length >= 1) {
        throw new Error("Mall Administrators are limited to creating one mall only.");
    }

    return await createMallModel({ mall_name, user_id, image_url });
}

//get all malls
export const getAllMalls = async (userId = null) => {
    return await getAllMallsModel(userId);
}

//get mall by id
export const getMallById = async (id) => {
    return await getMallByIdModel(id);
}

// get mall by filter
export const getMallsByFilter = async (keyword, keyvalue) => {
    return await getMallsByFilterModel(keyword, keyvalue);
};

//update mall
export const updateMall = async (id, data) => {
    const { user_id } = data;
    const admin = await getAdminById(user_id);
    if (!admin) throw new Error("Admin not found");
    if (admin.admin_type !== 'mall') throw new Error("Only mall admins can update malls");

    return await updateMallModel(id, data);
}

//delete mall
export const deleteMall = async (id, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin) throw new Error("Admin not found");
    if (admin.admin_type !== 'mall') throw new Error("Only mall admins can delete malls");

    return await deleteMallModel(id);
}
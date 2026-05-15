import { createStoreAdminRegister } from "../../db/models/storeAdminRegister.model.js";
import { createMallAdminRegister } from "../../db/models/mallAdminRegister.model.js";

export const submitStoreAdminRequest = async (userId, data) => {
    return await createStoreAdminRegister({
        user_id: userId,
        ...data
    });
};

export const submitMallAdminRequest = async (userId, data) => {
    return await createMallAdminRegister({
        user_id: userId,
        ...data
    });
};

import {
    createStore as createStoreModel,
    getAllStores as getAllStoresModel,
    getStoreById as getStoreByIdModel,
    updateStore as updateStoreModel,
    deleteStore as deleteStoreModel,
    getStoresByFilter as getStoresByFilterModel,
    getStoresByMallAdmin as getStoresByMallAdminModel
} from '../../db/models/store.model.js';

import { getAdminById } from '../../db/models/admins.model.js';

const allowedTiers = ['Local', 'Mid-tier', 'High-end'];

// Create store (store admin only)
export const createStore = async (data) => {
    const { user_id, brand_tier } = data;
    const admin = await getAdminById(user_id);

    if (!admin) throw new Error("Admin not found");
    if (admin.admin_type !== 'store') {
        throw new Error("Only store admins can create stores");
    }

    // --- Hard Limit Check (Max 1 Store) ---
    const existingStores = await getStoresForAdmin(admin);
    if (existingStores.length >= 1) {
        throw new Error("Maximum limit reached. You can only create up to 1 store on a free plan. Please contact support to upgrade.");
    }


    if (brand_tier && !allowedTiers.includes(brand_tier)) {
        throw new Error("Invalid brand tier. Expected: Local, Mid-tier, or High-end");
    }

    return await createStoreModel(data);
};

// Get all stores 
export const getAllStores = async () => {
    return await getAllStoresModel();
};

// Get stores for a specific admin
// Mall admin sees all stores, store admin sees only their own
export const getStoresForAdmin = async (admin) => {
    if (!admin) throw new Error("Admin not found");

    if (admin.admin_type === 'mall') {
        return await getStoresByMallAdminModel(admin.id);
    } else if (admin.admin_type === 'system') {
        return await getAllStoresModel();
    } else if (admin.admin_type === 'store') {
        const allStores = await getAllStoresModel();
        return allStores.filter(store => store.user_id === admin.id);
    } else {
        return [];
    }
};

// Get store by id for a specific admin
export const getStoreById = async (store_id, admin) => {
    const store = await getStoreByIdModel(store_id);
    if (!store) return null;
    if (admin.admin_type === 'store' && store.user_id !== admin.id) return null;

    return store;
};

// Get stores by filter 
export const getStoresByFilter = async (keyword, keyvalue, admin = null) => {
    let mallAdminId = null;
    if (admin && admin.admin_type === 'mall') {
        mallAdminId = admin.id;
    }
    return await getStoresByFilterModel(keyword, mallAdminId);
};

// Update store (store admin can update only their own store)
export const updateStore = async (store_id, data, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin) throw new Error("Admin not found");

    const store = await getStoreByIdModel(store_id);
    if (!store) throw new Error("Store not found");

    if (admin.admin_type !== 'store') {
        throw new Error("Only store admins can update stores");
    }

    if (store.user_id !== admin.id) {
        throw new Error("You can only update your own store");
    }

    if (data?.brand_tier && !allowedTiers.includes(data.brand_tier)) {
        throw new Error("Invalid brand tier. Expected: Local, Mid-tier, or High-end");
    }

    return await updateStoreModel(store_id, data);
};

// Delete store (store admin deletes own store, mall admin can delete any store)
export const deleteStore = async (store_id, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin) throw new Error("Admin not found");

    const store = await getStoreByIdModel(store_id);
    if (!store) throw new Error("Store not found");

    if (admin.admin_type === 'store' && store.user_id !== admin.id) {
        throw new Error("You can only delete your own store");
    }

    if (['store', 'mall', 'system'].includes(admin.admin_type)) {
        return await deleteStoreModel(store_id);
    }

    throw new Error("Not authorized");
};
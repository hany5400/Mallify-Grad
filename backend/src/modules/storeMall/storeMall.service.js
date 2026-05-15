import { getAdminById } from '../../db/models/admins.model.js';
import { getStoreById } from '../../db/models/store.model.js';
import { getMallById } from '../../db/models/mall.model.js';
import {
    linkStoreToMall as linkStoreToMallModel,
    unlinkStoreFromMall as unlinkStoreFromMallModel,
    isStoreInMall as isStoreInMallModel,
    getStoreIdsByMall as getStoreIdsByMallModel,
    getMallIdsByStore as getMallIdsByStoreModel,
    updateStoreMallLink as updateStoreMallLinkModel,
    getPendingStoreMallRequests,
    updateStoreMallStatus
} from '../../db/models/storeMall.model.js';


// add store to mall (mall admin only)
export const addStoreToMall = async (store_id, mall_id, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin || admin.admin_type !== 'mall')
        throw new Error("Only mall admins can link stores");

    const store = await getStoreById(store_id);
    if (!store) throw new Error("Store not found");

    const mall = await getMallById(mall_id);
    if (!mall) throw new Error("Mall not found");

    const alreadyLinked = await isStoreInMallModel({ store_id, mall_id });
    if (alreadyLinked) throw new Error("Store already linked to mall");

    return await linkStoreToMallModel({ store_id, mall_id });
};


// get all stores in a mall
export const listStoreIdsInMall = async (mall_id) => {
    return await getStoreIdsByMallModel(mall_id);
};


// get all malls for a store
export const listMallIdsForStore = async (store_id) => {
    return await getMallIdsByStoreModel(store_id);
};

// get links by keyword
export const getLinksByKeyword = async (keyword, keyvalue) => {
    if (keyword === 'mall_id') {
        const stores = await getStoreIdsByMallModel(keyvalue);
        return { mall_id: keyvalue, stores };
    } else if (keyword === 'store_id') {
        const malls = await getMallIdsByStoreModel(keyvalue);
        return { store_id: keyvalue, malls };
    } else {
        throw new Error("Invalid keyword. Allowed: mall_id, store_id");
    }
};


// remove store from mall (mall admin only)
export const removeStoreFromMall = async (store_id, mall_id, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin || admin.admin_type !== 'mall')
        throw new Error("Only mall admins can unlink stores");

    const linked = await isStoreInMallModel({ store_id, mall_id });
    if (!linked) throw new Error("Store is not linked to this mall");

    return await unlinkStoreFromMallModel({ store_id, mall_id });
};


// update store-mall link (mall admin only)
export const updateStoreInMall = async (old_store_id, old_mall_id, new_store_id, new_mall_id, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin || admin.admin_type !== 'mall')
        throw new Error("Only mall admins can update links");

    const store = await getStoreById(new_store_id);
    if (!store) throw new Error("New store not found");

    const mall = await getMallById(new_mall_id);
    if (!mall) throw new Error("New mall not found");

    return await updateStoreMallLinkModel({ old_store_id, old_mall_id, new_store_id, new_mall_id });
};

// Request store to be linked to a mall (store admin)
export const requestStoreAssignment = async (store_id, mall_id, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin || admin.admin_type !== 'store')
        throw new Error("Only store admins can request mall assignments");

    const store = await getStoreById(store_id);
    if (!store || store.user_id !== admin.id) throw new Error("Store not found or you are not the owner");

    const mall = await getMallById(mall_id);
    if (!mall) throw new Error("Mall not found");

    const alreadyLinked = await isStoreInMallModel({ store_id, mall_id });
    if (alreadyLinked) throw new Error("Store is already linked to this mall");

    // Insert as pending
    return await linkStoreToMallModel({ store_id, mall_id, status: 'pending' });
};

// Get pending assignments (mall admins only see this)
export const getPendingAssignments = async (user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin || admin.admin_type !== 'mall')
        throw new Error("Only mall admins can view pending assignments");

    return await getPendingStoreMallRequests(user_id);
};

// Approve or reject assignment
export const updateAssignmentStatus = async (store_id, mall_id, status, user_id) => {
    const admin = await getAdminById(user_id);
    if (!admin || admin.admin_type !== 'mall')
        throw new Error("Only mall admins can approve or reject assignments");

    if (!['approved', 'rejected'].includes(status)) {
        throw new Error("Invalid status update");
    }

    if (status === 'rejected') {
        return await unlinkStoreFromMallModel({ store_id, mall_id });
    } else {
        return await updateStoreMallStatus(store_id, mall_id, 'approved');
    }
};
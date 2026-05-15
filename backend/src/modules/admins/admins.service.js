import db from '../../db/connection.js';
import {
    createAdmin as createAdminModel,
    getAllAdmins as getAllAdminsModel,
    getAdminById as getAdminByIdModel,
    updateAdmin as updateAdminModel,
    deleteAdmin as deleteAdminModel,
    getAdminsByFilter as getAdminsByFilterModel
} from '../../db/models/admins.model.js';

import { getMallCount } from '../../db/models/mall.model.js';
import { getStoreCount, getStoreIdsByAdmin } from '../../db/models/store.model.js';
import { getProductCount, getProductCountByStores } from '../../db/models/product.model.js';
import { getUserCount, getUserCountByRole } from '../../db/models/users.model.js';
import { getPendingStoreRequestCount } from '../../db/models/storeAdminRegister.model.js';
import { getPendingMallRequestCount } from '../../db/models/mallAdminRegister.model.js';

import { getActiveDiscountCountByStores } from '../../db/models/discount.model.js';
import { getProductCategoryCountByStores } from '../../db/models/productCategory.model.js';

const allowedAdminTypes = ['mall', 'store'];

// create admin
export const createAdmin = async (data) => {
    const { name, email, password, admin_type } = data;
    if (!allowedAdminTypes.includes(admin_type)) {
        throw new Error("Invalid admin type. Allowed: mall, store");
    }
    return await createAdminModel({ name, email, password, admin_type });
}

// get all admins
export const getAllAdmins = async () => {
    return await getAllAdminsModel();
}

// get one admin by id
export const getAdminById = async (id) => {
    return await getAdminByIdModel(id);
}

// get admins by filter
export const getAdminsByFilter = async (keyword, keyvalue, search = null) => {
    return await getAdminsByFilterModel(keyword, keyvalue, search);
};

// update admin
export const updateAdmin = async (id, data) => {
    if (data.admin_type && !allowedAdminTypes.includes(data.admin_type)) {
        throw new Error("Invalid admin type. Allowed: mall, store");
    }
    return await updateAdminModel(id, data);
}

export const getStats = async (admin) => {
    // System Admin stats
    if (admin.role === 'system_admin') {
        const totalUsers = await getUserCount();
        const mallAdmins = await getUserCountByRole('mall_admin');
        const storeAdmins = await getUserCountByRole('store_admin');
        const regularUsers = await getUserCountByRole('user');
        
        const totalMalls = await getMallCount();
        const totalStores = await getStoreCount();
        const totalProducts = await getProductCount();
        const pendingStoreReqs = await getPendingStoreRequestCount();
        const pendingMallReqs = await getPendingMallRequestCount();

        return {
            totalUsers,
            mallAdmins,
            storeAdmins,
            regularUsers,
            totalMalls,
            totalStores,
            totalProducts,
            totalRoleRequests: pendingStoreReqs + pendingMallReqs
        };
    }

    // Mall Admin stats (Only their mall and its stores/products)
    if (admin.role === 'mall_admin' || admin.admin_type === 'mall') {
        const [malls] = await db.query('SELECT mall_id FROM mall WHERE user_id = ?', [admin.id]);
        const mallIds = malls.map(m => m.mall_id);
        
        if (mallIds.length === 0) {
            return { totalMalls: 0, totalStores: 0, totalProducts: 0 };
        }

        // Only count stores that are APPROVED and assigned to this admin's malls
        const [stores] = await db.query('SELECT DISTINCT store_id FROM store_mall WHERE mall_id IN (?) AND status = "approved"', [mallIds]);
        const storeIds = stores.map(s => s.store_id);

        let productCount = 0;
        if (storeIds.length > 0) {
            const [products] = await db.query('SELECT COUNT(*) as count FROM product WHERE store_id IN (?)', [storeIds]);
            productCount = products[0].count;
        }

        // Get pending store registration requests for this mall's waitlist
        const [pendingWaitlist] = await db.query(
            `SELECT COUNT(*) as count 
             FROM store_admin_register sar
             JOIN store s ON sar.user_id = s.user_id
             JOIN store_mall sm ON s.store_id = sm.store_id
             WHERE sm.mall_id IN (?) AND sar.status = 'pending'`,
            [mallIds]
        );

        return {
            totalMalls: mallIds.length,
            totalStores: storeIds.length,
            totalProducts: productCount,
            assignedMallId: mallIds[0] || null,
            pendingWaitlist: pendingWaitlist[0].count
        };
    }

    // Default: Store Admin stats (Only their own stores/products)
    const storeIds = await getStoreIdsByAdmin(admin.id);

    if (storeIds.length === 0) {
        return { totalStores: 0, totalProducts: 0, totalDiscounts: 0, totalCategories: 0 };
    }

    const totalProducts = await getProductCountByStores(storeIds);
    const totalDiscounts = await getActiveDiscountCountByStores(storeIds);
    const totalCategories = await getProductCategoryCountByStores(storeIds);

    // Get mall info for the store (assuming 1 store limit)
    let mallName = null;
    let mallImage = null;
    const [mallRows] = await db.query(`
        SELECT m.mall_name, m.image_url 
        FROM store_mall sm 
        JOIN mall m ON sm.mall_id = m.mall_id 
        WHERE sm.store_id = ? AND sm.status = 'approved'
    `, [storeIds[0]]);
    
    if (mallRows.length > 0) {
        mallName = mallRows[0].mall_name;
        mallImage = mallRows[0].image_url;
    }

    return {
        totalStores: storeIds.length,
        totalProducts,
        totalDiscounts,
        totalCategories,
        assignedMall: mallName,
        assignedMallImage: mallImage
    };
};


// delete admin
export const deleteAdmin = async (id) => {
    return await deleteAdminModel(id);
}
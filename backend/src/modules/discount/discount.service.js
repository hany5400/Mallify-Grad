import db from '../../db/connection.js';
import { getStoreById, getStoresForAdmin } from '../store/store.service.js';
import {
    createDiscount as createDiscountModel,
    getAllDiscounts as getAllDiscountsModel,
    getDiscountById as getDiscountByIdModel,
    updateDiscount as updateDiscountModel,
    deleteDiscount as deleteDiscountModel
} from '../../db/models/discount.model.js';

// Create discount
export const createDiscount = async (data, admin) => {
    if (admin.admin_type === 'mall') throw new Error("Mall admin can't create a discount");

    let { title, amount, store_id, expiry_date, targets } = data;

    const store = await getStoreById(store_id, admin);
    if (!store) throw new Error("Store not found or not authorized");

    if (!title) throw new Error("Title is required");
    if (!amount) throw new Error("Amount (percentage) is required");
    if (!expiry_date) throw new Error("Expiry date is required");
    
    if (targets && targets.length > 3) {
        throw new Error("You can only add up to 3 target items per discount");
    }

    // --- CHECK FOR OVERLAPPING DISCOUNTS ---
    if (targets && targets.length > 0) {
        for (const target of targets) {
            if (target.product_category_id) {
                const [existing] = await db.query(`
                    SELECT d.title, pc.product_category_name 
                    FROM discount d
                    JOIN discount_target dt ON d.discount_id = dt.discount_id
                    JOIN product_category pc ON dt.product_category_id = pc.product_category_id
                    WHERE d.store_id = ? 
                      AND dt.product_category_id = ? 
                      AND d.expiry_date > CURDATE()
                    LIMIT 1
                `, [store_id, target.product_category_id]);

                if (existing.length > 0) {
                    throw new Error(`The category "${existing[0].product_category_name}" already has an active discount ("${existing[0].title}"). Please wait for it to expire or delete it first.`);
                }
            }
        }
    }
    // ----------------------------------------
    
    const formattedExpiry = expiry_date;

    return await createDiscountModel({ 
        title, 
        amount, 
        store_id, 
        expiry_date: formattedExpiry,
        targets: targets || []
    });
};

// Get all discounts
export const getAllDiscounts = async (admin) => {
    const discounts = await getAllDiscountsModel();

    if (admin.admin_type === 'store') {
        const stores = await getStoresForAdmin(admin);
        const storeIds = stores.map(s => s.id);

        const filtered = discounts.filter(d =>
            storeIds.includes(Number(d.store_id))
        );

        if (filtered.length === 0) {
            // return empty list instead of error for better frontend handling
            return [];
        }

        return filtered;
    }

    else if (admin.admin_type === 'mall') {
        return discounts;
    }

    return [];
};

// Get public discounts (for mobile app)
export const getPublicDiscounts = async () => {
    return await getAllDiscountsModel();
};

// Get discount by id
export const getDiscountById = async (id, admin) => {
    const discount = await getDiscountByIdModel(id);
    if (!discount) return null;

    if (admin.admin_type === 'store') {
        const stores = await getStoresForAdmin(admin);
        const storeIds = stores.map(s => s.id);
        if (!storeIds.includes(Number(discount.store_id))) throw new Error("You can only see discounts for your store");
    }
    return discount;
};

// Update discount
export const updateDiscount = async (id, data, admin) => {
    if (admin.admin_type === 'mall') throw new Error("Mall admin can't update a discount");

    const existing = await getDiscountByIdModel(id);
    if (!existing) throw new Error("Discount not found");

    if (admin.admin_type === 'store') {
        const stores = await getStoresForAdmin(admin);
        const storeIds = stores.map(s => s.id);
        if (!storeIds.includes(Number(existing.store_id))) throw new Error("You can only update discounts for your store");
    }

    let { title, amount, expiry_date, targets } = data;

    const formattedExpiry = expiry_date ? expiry_date : existing.expiry_date;

    if (targets && targets.length > 3) {
        throw new Error("You can only add up to 3 target items per discount");
    }

    return await updateDiscountModel(id, {
        title: title ?? existing.title,
        amount: amount ?? existing.amount,
        expiry_date: formattedExpiry,
        targets: targets // If provided, update targets
    });
};

// Delete discount
export const deleteDiscount = async (id, admin) => {
    const existing = await getDiscountByIdModel(id);
    if (!existing) throw new Error("Discount not found");

    if (admin.admin_type === 'store') {
        const stores = await getStoresForAdmin(admin);
        const storeIds = stores.map(s => s.id);
        if (!storeIds.includes(Number(existing.store_id))) throw new Error("You can only delete discounts for your store");
    }

    return await deleteDiscountModel(id);
};
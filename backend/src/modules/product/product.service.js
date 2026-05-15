import { getStoreById, getStoresForAdmin } from '../store/store.service.js';
import {
    getProductById as getProductByIdModel,
    createProduct as createProductModel,
    updateProduct as updateProductModel,
    deleteProduct as deleteProductModel,
    getAllProducts as getAllProductsModel,
    getProductsByFilter as getProductsByFilterModel
} from '../../db/models/product.model.js';
import { getStoresByMallAdmin as getStoresByMallAdminModel } from '../../db/models/store.model.js';


// create product
export const createProduct = async (data, admin) => {
    if (admin.admin_type !== 'store') {
        throw new Error("Only store admins can add products");
    }

    if (!data.product_name || !data.store_id) {
        throw new Error("Missing required fields");
    }

    const store = await getStoreById(data.store_id, admin);
    if (!store) throw new Error("Store not found or not authorized");

    return await createProductModel({
        ...data,
        store_id: store.id
    });
};

//get all products
export const getAllProducts = async (admin, storeId = null) => {
    let products = await getAllProductsModel();

    if (storeId) {
        products = products.filter(p => String(p.store_id) === String(storeId));
    }

    if (admin.admin_type === 'store') {
        const stores = await getStoresForAdmin(admin);
        const storeIds = stores.map(s => s.id);

        const filtered = products.filter(p => storeIds.some(id => String(id) === String(p.store_id)));
        return filtered;

    }
    else if (admin.admin_type === 'mall') {
        const stores = await getStoresByMallAdminModel(admin.id);
        const storeIds = stores.map(s => String(s.id));
        return products.filter(p => storeIds.includes(String(p.store_id)));
    }

    return [];
};


// get product by ID
export const getProductById = async (id, admin) => {
    const product = await getProductByIdModel(id);
    if (!product) return null;

    if (admin.admin_type === 'store') {
        const store = await getStoreById(product.store_id, admin);
        if (!store) return null;
    }

    return product;
};

// filter products by string
export const getProductsByFilter = async (search, admin) => {
    const allProducts = await getProductsByFilterModel(search);

    if (admin.admin_type === 'store') {
        const stores = await getStoresForAdmin(admin);
        const storeIds = stores.map(s => s.id);
        const filtered = allProducts.filter(p => storeIds.some(id => String(id) === String(p.store_id)));
        return filtered;

    }

    if (admin.admin_type === 'mall') {
        return await getProductsByFilterModel(search, admin.id);
    }

    return [];
};

// update product
export const updateProduct = async (product_id, data, admin) => {
    const product = await getProductByIdModel(product_id);
    if (!product) throw new Error("Product not found");

    if (admin.admin_type === 'store') {
        const store = await getStoreById(product.store_id, admin);
        if (!store) throw new Error("You can only update products in your own store");
    } else if (admin.admin_type === 'mall') {
        throw new Error("Mall admins cannot update products");
    }

    return await updateProductModel(product_id, data);
};


// Delete product
export const deleteProduct = async (product_id, admin) => {
    const product = await getProductByIdModel(product_id);
    if (!product) throw new Error("Product not found");

    if (admin.admin_type === 'store') {
        const store = await getStoreById(product.store_id, admin);
        if (!store) throw new Error("You can only delete products in your own store");
    }

    return await deleteProductModel(product_id);
};
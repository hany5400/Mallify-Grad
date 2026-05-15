import { getProductById } from '../product/product.service.js';
import db from '../../db/connection.js';
import {
    createProductCategory as createProductCategoryModel,
    getAllProductCategories as getAllProductCategoriesModel,
    getProductCategoryById as getProductCategoryByIdModel,
    updateProductCategory as updateProductCategoryModel,
    deleteProductCategory as deleteProductCategoryModel,
    getProductCategoryByFilter as getProductCategoryByFilterModel
} from '../../db/models/productCategory.model.js';

const allowedProducts = ['small', 'medium', 'large', 'x-large'];

// create category (store admin only)
export const createProductCategory = async (data, admin) => {
    if (admin.admin_type !== 'store') {
        throw new Error("Only store admins can create product categories");
    }

    if (!data.product_category_name || !data.size || !data.price) {
        throw new Error("Missing required fields");
    }

    const product = await getProductById(data.product_id, admin);
    if (!product) throw new Error("Product not found or you are not authorized");

    const size = data.size.toLowerCase();
    if (!allowedProducts.includes(size)) {
        throw new Error("Invalid product size");
    }

    if (isNaN(data.price)) {
        throw new Error("Price must be a number");
    }

    return await createProductCategoryModel({
        ...data,
        size,
        price: Number(data.price),
        product_id: product.id
    });
};

// get all categories
export const getAllProductCategories = async (admin, productId = null, skipDiscounted = false) => {
    let categories = await getAllProductCategoriesModel();

    if (productId) {
        categories = categories.filter(c => String(c.product_id) === String(productId));
    }

    if (skipDiscounted) {
        const [discounted] = await db.query(`
            SELECT dt.product_category_id 
            FROM discount d
            JOIN discount_target dt ON d.discount_id = dt.discount_id
            WHERE d.expiry_date > CURDATE()
        `);
        const discountedIds = discounted.map(d => d.product_category_id);
        categories = categories.filter(c => !discountedIds.includes(c.id));
    }

    if (admin.admin_type === 'store') {
        const filtered = [];
        for (const cat of categories) {
            const product = await getProductById(cat.product_id, admin);
            if (product) filtered.push(cat);
        }

        return filtered;
    }

    return categories;
};


// get category by id
export const getProductCategoryById = async (id, admin) => {
    const category = await getProductCategoryByIdModel(id);
    if (!category) return null;

    if (admin.admin_type === 'store') {
        const product = await getProductById(category.product_id, admin);
        if (!product) return null;
    }

    return category;
};

export const getProductCategoryByFilter = async (search, admin) => {
    const allCategories = await getProductCategoryByFilterModel(search);

    if (admin && admin.admin_type === 'store') {
        const filtered = [];
        for (const cat of allCategories) {
            const product = await getProductById(cat.product_id, admin);
            if (product) filtered.push(cat);
        }
        return filtered;
    }
    return allCategories;
};

// update category (store admin only)
export const updateProductCategory = async (id, data, admin) => {
    const category = await getProductCategoryByIdModel(id);
    if (!category) throw new Error("Category not found");

    if (admin.admin_type !== 'store') {
        throw new Error("Only store admins can update product categories");
    }

    if (data.size) {
        const size = data.size.toLowerCase();

        if (!allowedProducts.includes(size)) {
            throw new Error("Invalid product size");
        }

        data.size = size;
    }

    if (data.price && isNaN(data.price)) {
        throw new Error("Price must be a number");
    }

    if (data.price) {
        data.price = Number(data.price);
    }

    const currentProduct = await getProductById(category.product_id, admin);
    if (!currentProduct) throw new Error("You are not authorized to update this category");

    if (data.product_id) {
        const newProduct = await getProductById(data.product_id, admin);
        if (!newProduct) throw new Error("The target product was not found or you are not authorized to use it");
        data.product_id = newProduct.id;
    }

    return await updateProductCategoryModel(id, data);
};


// delete category
export const deleteProductCategory = async (id, admin) => {
    const category = await getProductCategoryByIdModel(id);
    if (!category) throw new Error("Category not found");

    if (admin.admin_type === 'store') {
        const product = await getProductById(category.product_id, admin);
        if (!product) throw new Error("You are not authorized to delete this category");
    }
    return await deleteProductCategoryModel(id);
};
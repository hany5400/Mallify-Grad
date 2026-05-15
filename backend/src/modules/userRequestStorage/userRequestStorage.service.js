import { getUserRequestById } from '../../db/models/userRequest.model.js';
import {
    createUserRequestStorage as createStorageModel,
    getAllUserRequestStorage as getAllStorageModel,
    getStorageByRequestId as getByRequestModel,
    getStorageByProductId as getByProductModel,
    getStorageByStoreId as getByStoreModel,
    updateUserRequestStorage as updateStorageModel,
    deleteUserRequestStorage as deleteStorageModel
} from '../../db/models/userRequestStorage.model.js';
import { getProductById as getProductByIdModel } from '../../db/models/product.model.js';
import { getStoreById as getStoreByIdModel } from '../../db/models/store.model.js';

// create storage
export const createUserRequestStorage = async (user, data) => {
    const { request_id, product_id, store_id } = data;

    if (!request_id || !product_id || !store_id) throw new Error("All fields are required");

    const request = await getUserRequestById(request_id);
    if (!request) throw new Error("Request not found");
    if (request.user_id !== user.id) throw new Error("You are not allowed to use this request");

    const product = await getProductByIdModel(product_id);
    if (!product) throw new Error("Product not found");

    const store = await getStoreByIdModel(store_id);
    if (!store) throw new Error("Store not found");

    if (product.store_id !== store.id) throw new Error("This store does not sell this product");

    return await createStorageModel({ request_id, product_id, store_id });
};

// get all storage (admin)
export const getAllUserRequestStorage = async () => {
    return await getAllStorageModel();
};

// get storage by request
export const getStorageByRequestId = async (request_id) => {
    const request = await getUserRequestById(request_id);
    if (!request) throw new Error("Request not found");
    return await getByRequestModel(request_id);
};

// get storage by product
export const getStorageByProductId = async (product_id) => {
    return await getByProductModel(product_id);
};

// get storage by store
export const getStorageByStoreId = async (store_id) => {
    return await getByStoreModel(store_id);
};

// get my storage (user) with optional filter
export const getMyStorage = async (user, keyword, keyvalue) => {
    let storages;

    if (keyword && keyvalue) {
        let allFiltered = [];
        if (keyword === "request_id") allFiltered = await getByRequestModel(keyvalue);
        else if (keyword === "product_id") allFiltered = await getByProductModel(keyvalue);
        else if (keyword === "store_id") allFiltered = await getByStoreModel(keyvalue);
        else throw new Error("Invalid filter field");

        storages = allFiltered.filter(s => {
            return s.request_id && s.request_id === s.request_id && s.user_id === user.id;
        });

    } else {
        const allStorages = await getAllStorageModel();
        storages = [];
        for (const s of allStorages) {
            const request = await getUserRequestById(s.request_id);
            if (request.user_id === user.id) storages.push(s);
        }
    }

    return storages;
};

// update storage
export const updateUserRequestStorage = async (user, oldData, newData) => {
    const { request_id, store_id, product_id } = oldData;

    const request = await getUserRequestById(request_id);
    if (!request) throw new Error("Request not found");

    if (Number(request.user_id) !== Number(user.id))
        throw new Error("Not allowed");

    const existing = await getByRequestModel(request_id);
    const found = existing.find(
        s =>
            Number(s.store_id) === Number(store_id) &&
            Number(s.product_id) === Number(product_id)
    );

    if (!found) throw new Error("Row not found");

    if (newData.new_product_id) {
        const product = await getProductByIdModel(newData.new_product_id);
        if (!product) throw new Error("Product not found");
    }

    if (newData.new_store_id) {
        const store = await getStoreByIdModel(newData.new_store_id);
        if (!store) throw new Error("Store not found");
    }

    if (newData.new_product_id && newData.new_store_id) {
        const product = await getProductByIdModel(newData.new_product_id);
        if (product.store_id !== newData.new_store_id)
            throw new Error("Invalid store-product relation");
    }

    return await updateStorageModel(oldData, newData);
};

// delete storage
export const deleteUserRequestStorage = async (user, request_id, product_id, store_id) => {

    const request = await getUserRequestById(request_id);
    if (!request) throw new Error("Request not found");

    if (Number(request.user_id) !== Number(user.id))
        throw new Error("Not allowed");

    const existing = await getByRequestModel(request_id);

    const found = existing.find(
        s =>
            Number(s.product_id) === Number(product_id) &&
            Number(s.store_id) === Number(store_id)
    );

    if (!found) throw new Error("Row not found");

    return await deleteStorageModel(request_id, product_id, store_id);
};
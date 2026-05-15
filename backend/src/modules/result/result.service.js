import {
    createResult as createResultModel,
    getAllResults as getAllResultsModel,
    getResultById as getResultByIdModel,
    updateResult as updateResultModel,
    deleteResult as deleteResultModel,
    getResultsByFilter as getResultsByFilterModel
} from '../../db/models/result.model.js';
import { getUserRequestById } from '../../db/models/userRequest.model.js';

// create result
export const createResult = async (user, data) => {
    const { request_id, total_price } = data;

    const request = await getUserRequestById(request_id);
    if (!request) throw new Error("User request not found");
    if (request.user_id !== user.id) throw new Error("You are not allowed to create result for this request");

    return await createResultModel({ request_id, total_price });
};

// get all results (admin only)
export const getAllResults = async () => {
    return await getAllResultsModel();
};

// get result by id
export const getResultById = async (id) => {
    const result = await getResultByIdModel(id);
    if (!result) throw new Error("Result not found");
    return result;
};

// get results by filter (for admin)
export const getResultsByFilter = async (keyword, keyvalue) => {
    return await getResultsByFilterModel(keyword, keyvalue);
};

// get results for logged-in user with optional filter
export const getMyResults = async (user, keyword, keyvalue) => {
    let results;

    if (keyword && keyvalue) {
        const allFiltered = await getResultsByFilterModel(keyword, keyvalue);
        results = [];
        for (const r of allFiltered) {
            const request = await getUserRequestById(r.request_id);
            if (request.user_id === user.id) results.push(r);
        }
    } else {
        const allResults = await getAllResultsModel();
        results = [];
        for (const r of allResults) {
            const request = await getUserRequestById(r.request_id);
            if (request.user_id === user.id) results.push(r);
        }
    }

    return results;
};

// update result
export const updateResult = async (user, id, data) => {
    const { total_price } = data;

    const result = await getResultByIdModel(id);
    if (!result) throw new Error("Result not found");

    const request = await getUserRequestById(result.request_id);
    if (request.user_id !== user.id) throw new Error("You are not allowed to update this result");

    return await updateResultModel(id, { total_price });
};

// delete result
export const deleteResult = async (user, id) => {
    const result = await getResultByIdModel(id);
    if (!result) throw new Error("Result not found");

    const request = await getUserRequestById(result.request_id);
    if (request.user_id !== user.id) throw new Error("You are not allowed to delete this result");

    return await deleteResultModel(id);
};
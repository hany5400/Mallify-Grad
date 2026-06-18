import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
});

// Automatically inject Authorization token if available in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth endpoints
export const login = (email, password) => api.post('/auth/admins/login', { email, password });
export const registerMall = (fd) => api.post('/auth/admins/register/mall', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const registerStore = (fd) => api.post('/auth/admins/register/store', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const verifyCode = (email, inviteCode) => api.post('/auth/admins/verify-code', { email, inviteCode });
export const verifyMallCode = (email, inviteCode) => api.post('/auth/admins/verify-mall-code', { email, inviteCode });

// Statistics
export const getStats = () => api.get('/admins/stats');

// Role waitlist / Onboarding requests
export const getPendingRequests = () => api.get('/system-admin/pending-requests');
export const approveRoleRequest = (type, id) => api.post(`/system-admin/approve-${type}/${id}`);
export const rejectRoleRequest = (type, id) => api.post(`/system-admin/reject-${type}/${id}`);
export const processRequest = (id, action, userId) => api.put(`/auth/admins/requests/${id}/${action}`, { user_id: userId });

// Admins overview & creation
export const getMallAdminsOverview = (search = '') => api.get(`/system-admin/mall-admins-overview${search ? `?search=${search}` : ''}`);
export const getStoreAdminsOverview = (search = '') => api.get(`/system-admin/store-admins-overview${search ? `?search=${search}` : ''}`);
export const getAdmins = (type, search = '') => api.get(`/admins?type=${type}${search ? `&search=${search}` : ''}`);
export const createAdmin = (data) => api.post('/admins', data);
export const deleteAdmin = (id) => api.delete(`/admins/${id}`);

// Users
export const getUsers = (search = '') => api.get(`/users${search ? `?search=${search}` : ''}`);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Malls
export const getMalls = () => api.get('/mall');
export const createMall = (fd) => api.post('/mall', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateMall = (id, fd) => api.put(`/mall/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMall = (id) => api.delete(`/mall/${id}`);

// Stores
export const getStores = (search = '') => api.get(`/store${search ? `?search=${search}` : ''}`);
export const createStore = (fd) => api.post('/store', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateStore = (id, fd) => api.put(`/store/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteStore = (id) => api.delete(`/store/${id}`);

// Products
export const getProducts = (search = '', storeId = '') => {
  let url = '/product';
  const params = [];
  if (search) params.push(`search=${search}`);
  if (storeId) params.push(`store_id=${storeId}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return api.get(url);
};
export const createProduct = (fd) => api.post('/product', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, fd) => api.put(`/product/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/product/${id}`);

// Product Categories (Product Types)
export const getProductCategories = (search = '', productId = '', skipDiscounted = false) => {
  let url = '/productCategory';
  const params = [];
  if (search) params.push(`search=${search}`);
  if (productId) params.push(`product_id=${productId}`);
  if (skipDiscounted) params.push('skipDiscounted=true');
  if (params.length > 0) url += `?${params.join('&')}`;
  return api.get(url);
};
export const createProductCategory = (fd) => api.post('/productCategory', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProductCategory = (id, fd) => api.put(`/productCategory/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProductCategory = (id) => api.delete(`/productCategory/${id}`);

// Discounts
export const getDiscounts = (search = '') => api.get(`/discount${search ? `?keyword=title&keyvalue=${search}` : ''}`);
export const createDiscount = (data) => api.post('/discount', data);
export const updateDiscount = (id, data) => api.put(`/discount/${id}`, data);
export const deleteDiscount = (id) => api.delete(`/discount/${id}`);

// Mall Assignment (Store-Mall connections)
export const getStoreMallRequests = () => api.get('/storeMall/requests');
export const createStoreMallRequest = (storeId, mallId) => api.post('/storeMall/requests', { store_id: storeId, mall_id: mallId });
export const processStoreMallRequest = (storeId, mallId, action) => api.put(`/storeMall/requests/${storeId}/${mallId}/${action}`);

export default api;
export { API_BASE };

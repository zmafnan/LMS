import axiosClient from './axiosClient'

// Priorities
export const getPriorities = () => axiosClient.get('/master/priorities')
export const createPriority = (data) => axiosClient.post('/master/priorities', data)
export const updatePriority = (id, data) => axiosClient.put(`/master/priorities/${id}`, data)
export const deletePriority = (id) => axiosClient.delete(`/master/priorities/${id}`)

// Categories
export const getCategories = () => axiosClient.get('/master/categories')
export const createCategory = (data) => axiosClient.post('/master/categories', data)
export const updateCategory = (id, data) => axiosClient.put(`/master/categories/${id}`, data)
export const deleteCategory = (id) => axiosClient.delete(`/master/categories/${id}`)

// Users
export const getUsers = () => axiosClient.get('/users')
export const createUser = (data) => axiosClient.post('/users', data)
export const updateUser = (id, data) => axiosClient.put(`/users/${id}`, data)
export const deleteUser = (id) => axiosClient.delete(`/users/${id}`)

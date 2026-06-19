import axiosClient from './axiosClient'

export const getEmployees = (filters = {}) => {
  return axiosClient.get('/multiskill/employees', { params: filters })
}

export const createEmployee = (data) => {
  return axiosClient.post('/multiskill/employees', data)
}

export const updateEmployee = (id, data) => {
  return axiosClient.put(`/multiskill/employees/${id}`, data)
}

export const deleteEmployee = (id) => {
  return axiosClient.delete(`/multiskill/employees/${id}`)
}

export const bulkImportEmployees = (data) => {
  return axiosClient.post('/multiskill/employees/bulk', data)
}

export const getAnalytics = () => {
  return axiosClient.get('/multiskill/analytics')
}

export const getReports = (filters = {}) => {
  return axiosClient.get('/multiskill/reports', { params: filters })
}

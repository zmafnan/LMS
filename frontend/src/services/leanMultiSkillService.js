import axiosClient from './axiosClient'

export const getLeanEmployees = (filters = {}) => {
  return axiosClient.get('/multiskill/lean/employees', { params: filters })
}

export const createLeanEmployee = (data) => {
  return axiosClient.post('/multiskill/lean/employees', data)
}

export const updateLeanEmployee = (id, data) => {
  return axiosClient.put(`/multiskill/lean/employees/${id}`, data)
}

export const deleteLeanEmployee = (id) => {
  return axiosClient.delete(`/multiskill/lean/employees/${id}`)
}

export const bulkImportLeanEmployees = (data) => {
  return axiosClient.post('/multiskill/lean/employees/bulk', data)
}

export const getLeanAnalytics = () => {
  return axiosClient.get('/multiskill/lean/analytics')
}

export const getLeanReports = (filters = {}) => {
  return axiosClient.get('/multiskill/lean/reports', { params: filters })
}

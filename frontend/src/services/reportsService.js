import axiosClient from './axiosClient'

export const getReports = (filters = {}) => {
  return axiosClient.get('/reports', { params: filters })
}

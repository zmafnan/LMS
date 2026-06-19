import axiosClient from './axiosClient'

export const getDashboardData = () => {
  return axiosClient.get('/dashboard')
}

import axiosClient from '../../../services/axiosClient'

const api = {
  get: async (url, config) => {
    const res = await axiosClient.get(`/audit6s${url}`, config);
    return { data: res };
  },
  post: async (url, data, config) => {
    // If data is FormData, let Axios automatically set multipart/form-data with boundary
    const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const res = await axiosClient.post(`/audit6s${url}`, data, { ...config, headers: { ...headers, ...config?.headers } });
    return { data: res };
  },
  put: async (url, data, config) => {
    const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const res = await axiosClient.put(`/audit6s${url}`, data, { ...config, headers: { ...headers, ...config?.headers } });
    return { data: res };
  },
  delete: async (url, config) => {
    const res = await axiosClient.delete(`/audit6s${url}`, config);
    return { data: res };
  },
  defaults: {
    baseURL: axiosClient.defaults.baseURL + '/audit6s'
  }
}

export default api

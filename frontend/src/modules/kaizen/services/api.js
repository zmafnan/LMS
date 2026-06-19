import axiosClient from '../../../services/axiosClient'

const api = {
  get: async (url, config) => {
    const res = await axiosClient.get(`/kaizen${url}`, config);
    return { data: res };
  },
  post: async (url, data, config) => {
    const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const res = await axiosClient.post(`/kaizen${url}`, data, { ...config, headers: { ...headers, ...config?.headers } });
    return { data: res };
  },
  put: async (url, data, config) => {
    const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const res = await axiosClient.put(`/kaizen${url}`, data, { ...config, headers: { ...headers, ...config?.headers } });
    return { data: res };
  },
  patch: async (url, data, config) => {
    const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const res = await axiosClient.patch(`/kaizen${url}`, data, { ...config, headers: { ...headers, ...config?.headers } });
    return { data: res };
  },
  delete: async (url, config) => {
    const res = await axiosClient.delete(`/kaizen${url}`, config);
    return { data: res };
  },
  defaults: {
    baseURL: axiosClient.defaults.baseURL + '/kaizen'
  }
}

export default api

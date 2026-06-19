import axios from 'axios'
import useAuthStore from '../store/authStore'

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api'
  }
  const path = window.location.pathname
  const publicIndex = path.indexOf('/public/')
  if (publicIndex !== -1) {
    if (path.includes('/public/index.php')) {
      return path.substring(0, publicIndex) + '/public/index.php/api'
    }
    return path.substring(0, publicIndex) + '/public/api'
  }
  return '/api'
}

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to inject token
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for errors
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export default axiosClient

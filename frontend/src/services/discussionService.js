import axiosClient from './axiosClient'

export const getMessages = () => {
  return axiosClient.get('/discussions')
}

export const postMessage = (message) => {
  return axiosClient.post('/discussions', { message })
}

import axiosClient from './axiosClient'

export const login = (username, password) => {
  return axiosClient.post('/auth/login', { username, password })
}

export const getHealth = () => {
  return axiosClient.get('/auth/health')
}

export const getProfile = () => {
  return axiosClient.get('/users/profile')
}

export const updateProfile = ({ username, email, avatar }) => {
  const formData = new FormData()
  if (username) formData.append('username', username)
  if (email) formData.append('email', email)
  if (avatar) formData.append('avatar', avatar)

  return axiosClient.post('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

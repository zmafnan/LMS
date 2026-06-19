import axiosClient from './axiosClient'

export const getTasks = (filters = {}) => {
  return axiosClient.get('/tasks', { params: filters })
}

export const getTaskDetails = (id) => {
  return axiosClient.get(`/tasks/${id}`)
}

export const createTask = (taskData) => {
  return axiosClient.post('/tasks', taskData)
}

export const updateTask = (id, taskData) => {
  return axiosClient.put(`/tasks/${id}`, taskData)
}

export const deleteTask = (id) => {
  return axiosClient.delete(`/tasks/${id}`)
}

export const uploadAttachment = (id, formData) => {
  return axiosClient.post(`/tasks/${id}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteAttachment = (id) => {
  return axiosClient.delete(`/tasks/attachments/${id}`)
}

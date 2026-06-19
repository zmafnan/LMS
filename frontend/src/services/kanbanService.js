import axiosClient from './axiosClient'

export const getKanbanBoard = () => {
  return axiosClient.get('/kanban/board')
}

export const moveTask = (taskId, kanbanCategoryId) => {
  return axiosClient.put('/kanban/move', { 
    task_id: taskId, 
    kanban_category_id: kanbanCategoryId 
  })
}

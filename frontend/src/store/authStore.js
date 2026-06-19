import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  
  login: (userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    set({ token: userData.token, user: userData.user })
  },

  updateUser: (updates) => {
    const currentUser = get().user || {}
    const nextUser = { ...currentUser, ...updates }
    localStorage.setItem('user', JSON.stringify(nextUser))
    set({ user: nextUser })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  hasRole: (roles) => {
    const user = get().user
    if (!user) return false
    const role = String(user.role || '').toLowerCase()
    return roles.map(r => r.toLowerCase()).includes(role)
  }
}))

export default useAuthStore

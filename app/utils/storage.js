// Token存储键名
const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_info'

export const storage = {
  // 设置token
  setToken(token) {
    uni.setStorageSync(TOKEN_KEY, token)
  },

  // 获取token
  getToken() {
    return uni.getStorageSync(TOKEN_KEY) || ''
  },

  // 清除token
  removeToken() {
    uni.removeStorageSync(TOKEN_KEY)
  },

  // 设置用户信息
  setUser(user) {
    uni.setStorageSync(USER_KEY, user)
  },

  // 获取用户信息
  getUser() {
    return uni.getStorageSync(USER_KEY) || null
  },

  // 清除用户信息
  removeUser() {
    uni.removeStorageSync(USER_KEY)
  },

  // 清除所有登录信息
  clearAuth() {
    this.removeToken()
    this.removeUser()
  },

  // 通用存储方法
  setItem(key, value) {
    uni.setStorageSync(key, value)
  },

  // 通用获取方法
  getItem(key) {
    return uni.getStorageSync(key)
  },

  // 通用删除方法
  removeItem(key) {
    uni.removeStorageSync(key)
  }
}


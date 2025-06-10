import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, AuthState, LoginForm, Permission, PermissionModule, PermissionAction, PermissionCheck } from '../types/auth'
import { DEFAULT_USERS, getRolePermissions } from '../config/permissions'
import { message } from 'antd'

// 认证上下文类型
interface AuthContextType extends AuthState {
  login: (loginForm: LoginForm) => Promise<boolean>
  logout: () => void
  hasPermission: (module: PermissionModule, action?: PermissionAction) => boolean
  checkPermission: (module: PermissionModule, action?: PermissionAction) => PermissionCheck
  getUserPermissions: () => Permission[]
  refreshUserData: () => void
}

// Action 类型
type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_COMPLETE' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; permissions: Permission[] } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_USER'; payload: User }

// 初始状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  permissions: [],
  loading: false,
  initializing: true
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INIT_START':
      return {
        ...state,
        initializing: true
      }
    case 'INIT_COMPLETE':
      return {
        ...state,
        initializing: false
      }
    case 'LOGIN_START':
      return {
        ...state,
        loading: true
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        loading: false,
        initializing: false
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        permissions: [],
        isAuthenticated: false,
        loading: false,
        initializing: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        permissions: [],
        isAuthenticated: false,
        loading: false,
        initializing: false
      }
    case 'REFRESH_USER':
      return {
        ...state,
        user: action.payload
      }
    default:
      return state
  }
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 存储密钥
const STORAGE_KEYS = {
  USER: 'nflab_user',
  TOKEN: 'nflab_token',
  REMEMBER: 'nflab_remember'
}

// AuthProvider 组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 初始化时检查本地存储
  useEffect(() => {
    const initAuth = () => {
      dispatch({ type: 'INIT_START' })
      
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      
      if (storedUser && storedToken) {
        try {
          const user: User = JSON.parse(storedUser)
          const permissions = getRolePermissions(user.role)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, permissions }
          })
        } catch (error) {
          console.error('恢复用户状态失败:', error)
          localStorage.removeItem(STORAGE_KEYS.USER)
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          dispatch({ type: 'INIT_COMPLETE' })
        }
      } else {
        dispatch({ type: 'INIT_COMPLETE' })
      }
    }

    initAuth()
  }, [])

  // 登录函数
  const login = async (loginForm: LoginForm): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' })

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 查找用户
      const user = DEFAULT_USERS.find(u => u.username === loginForm.username)
      
      if (!user) {
        message.error('用户名不存在')
        dispatch({ type: 'LOGIN_FAILURE' })
        return false
      }

      if (user.status !== 'active') {
        message.error('账户已被禁用，请联系管理员')
        dispatch({ type: 'LOGIN_FAILURE' })
        return false
      }

      // 简单密码验证 (生产环境中应该加密)
      const defaultPassword = user.username === 'admin' ? 'admin123' : '123456'
      if (loginForm.password !== defaultPassword) {
        message.error('密码错误')
        dispatch({ type: 'LOGIN_FAILURE' })
        return false
      }

      // 更新最后登录时间
      const updatedUser = {
        ...user,
        lastLoginAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }

      // 获取权限
      const permissions = getRolePermissions(user.role)

      // 存储到本地
      const token = `token_${user.id}_${Date.now()}`
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      
      if (loginForm.remember) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true')
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER)
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: updatedUser, permissions }
      })

      message.success(`欢迎回来，${updatedUser.name}！`)
      return true
    } catch (error) {
      console.error('登录失败:', error)
      message.error('登录失败，请重试')
      dispatch({ type: 'LOGIN_FAILURE' })
      return false
    }
  }

  // 登出函数
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    
    // 如果用户没有选择记住密码，清除所有相关存储
    const remember = localStorage.getItem(STORAGE_KEYS.REMEMBER)
    if (!remember) {
      localStorage.clear()
    }

    dispatch({ type: 'LOGOUT' })
    message.success('已安全退出')
  }

  // 权限检查函数
  const hasPermission = (module: PermissionModule, action?: PermissionAction): boolean => {
    if (!state.user || !state.isAuthenticated) {
      return false
    }

    // 管理员拥有所有权限
    if (state.user.role === 'admin') {
      return true
    }

    const modulePermission = state.permissions.find(p => p.module === module)
    if (!modulePermission) {
      return false
    }

    // 如果没有指定动作，只要有模块权限就返回 true
    if (!action) {
      return true
    }

    return modulePermission.actions.includes(action)
  }

  // 详细权限检查函数
  const checkPermission = (module: PermissionModule, action?: PermissionAction): PermissionCheck => {
    if (!state.user || !state.isAuthenticated) {
      return { hasPermission: false, reason: '用户未登录' }
    }

    if (state.user.role === 'admin') {
      return { hasPermission: true }
    }

    const modulePermission = state.permissions.find(p => p.module === module)
    if (!modulePermission) {
      return { hasPermission: false, reason: '没有访问此模块的权限' }
    }

    if (!action) {
      return { hasPermission: true }
    }

    if (!modulePermission.actions.includes(action)) {
      return { hasPermission: false, reason: `没有执行"${action}"操作的权限` }
    }

    return { hasPermission: true }
  }

  // 获取用户权限列表
  const getUserPermissions = (): Permission[] => {
    return state.permissions
  }

  // 刷新用户数据
  const refreshUserData = () => {
    if (state.user) {
      const updatedUser = DEFAULT_USERS.find(u => u.id === state.user!.id)
      if (updatedUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
        dispatch({ type: 'REFRESH_USER', payload: updatedUser })
      }
    }
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission,
    checkPermission,
    getUserPermissions,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用')
  }
  return context
} 
// 用户角色类型
export type UserRole = 'admin' | 'project_manager' | 'modeler' | 'renderer' | 'sales'

// 权限模块类型
export type PermissionModule = 'dashboard' | 'projects' | 'clients' | 'finance' | 'team' | 'gantt'

// 权限操作类型
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export'

// 用户接口
export interface User {
  id: string
  username: string
  name: string
  email: string
  role: UserRole
  department: string
  avatar?: string
  createdAt: string
  lastLoginAt?: string
  status: 'active' | 'inactive'
}

// 权限配置接口
export interface Permission {
  module: PermissionModule
  actions: PermissionAction[]
  conditions?: {
    [key: string]: any
  }
}

// 角色权限配置
export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  description: string
}

// 登录表单接口
export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

// 认证状态接口
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  permissions: Permission[]
  loading: boolean
  initializing: boolean
}

// 权限检查结果
export interface PermissionCheck {
  hasPermission: boolean
  reason?: string
} 
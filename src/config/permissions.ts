import { RolePermissions, User } from '../types/auth'

// 角色权限配置
export const ROLE_PERMISSIONS: RolePermissions[] = [
  // 1. 管理员 - 拥有所有权限
  {
    role: 'admin',
    description: '系统管理员，拥有所有权限',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'projects', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { module: 'finance', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { module: 'team', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { module: 'gantt', actions: ['view', 'edit'] }
    ]
  },
  
  // 2. 项目管理 - 项目管理 + 客户管理 + 团队管理(项目管理和销售部分)
  {
    role: 'project_manager',
    description: '项目经理，负责项目管理、客户管理和团队协调',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'projects', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
      { 
        module: 'team', 
        actions: ['view', 'edit'], 
        conditions: { 
          departments: ['项目经理', '销售'],
          canManagePayments: true 
        } 
      },
      { module: 'gantt', actions: ['view', 'edit'] }
    ]
  },
  
  // 3. 模型 - 项目管理 + 团队管理(模型部分)
  {
    role: 'modeler',
    description: '模型师，负责项目执行和模型团队管理',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'projects', actions: ['view', 'edit'] },
      { 
        module: 'team', 
        actions: ['view'], 
        conditions: { 
          departments: ['模型'],
          canViewOwnData: true 
        } 
      },
      { module: 'gantt', actions: ['view', 'edit'] }
    ]
  },
  
  // 4. 渲染 - 项目管理 + 团队管理(渲染部分)
  {
    role: 'renderer',
    description: '渲染师，负责项目执行和渲染团队管理',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'projects', actions: ['view', 'edit'] },
      { 
        module: 'team', 
        actions: ['view'], 
        conditions: { 
          departments: ['渲染'],
          canViewOwnData: true 
        } 
      },
      { module: 'gantt', actions: ['view', 'edit'] }
    ]
  },
  
  // 5. 销售 - 项目管理 + 财务管理 + 客户管理 + 团队管理(项目管理和销售部分)
  {
    role: 'sales',
    description: '销售人员，负责项目管理、财务管理、客户管理和销售团队管理',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'projects', actions: ['view', 'create', 'edit', 'export'] },
      { module: 'clients', actions: ['view', 'create', 'edit', 'export'] },
      { module: 'finance', actions: ['view', 'export'] },
      { 
        module: 'team', 
        actions: ['view'], 
        conditions: { 
          departments: ['项目经理', '销售'],
          canViewPayments: true 
        } 
      },
      { module: 'gantt', actions: ['view'] }
    ]
  }
]

// 默认测试用户
export const DEFAULT_USERS: User[] = [
  {
    id: 'admin001',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@nflab.com',
    role: 'admin',
    department: '管理部',
    createdAt: '2024-01-01',
    lastLoginAt: '2024-12-25 23:45:00',
    status: 'active'
  },
  {
    id: 'pm001',
    username: 'project_manager',
    name: '张项目',
    email: 'pm@nflab.com',
    role: 'project_manager',
    department: '项目管理部',
    createdAt: '2024-01-01',
    lastLoginAt: '2024-12-25 20:30:00',
    status: 'active'
  },
  {
    id: 'model001',
    username: 'modeler',
    name: '李建模',
    email: 'modeler@nflab.com',
    role: 'modeler',
    department: '模型部',
    createdAt: '2024-01-01',
    lastLoginAt: '2024-12-25 18:15:00',
    status: 'active'
  },
  {
    id: 'render001',
    username: 'renderer',
    name: '王渲染',
    email: 'renderer@nflab.com',
    role: 'renderer',
    department: '渲染部',
    createdAt: '2024-01-01',
    lastLoginAt: '2024-12-25 19:20:00',
    status: 'active'
  },
  {
    id: 'sales001',
    username: 'sales',
    name: '陈销售',
    email: 'sales@nflab.com',
    role: 'sales',
    department: '销售部',
    createdAt: '2024-01-01',
    lastLoginAt: '2024-12-25 21:00:00',
    status: 'active'
  }
]

// 获取角色权限
export const getRolePermissions = (role: string) => {
  return ROLE_PERMISSIONS.find(rp => rp.role === role)?.permissions || []
}

// 角色中文名称映射
export const ROLE_NAMES = {
  admin: '系统管理员',
  project_manager: '项目经理',
  modeler: '模型师',
  renderer: '渲染师',
  sales: '销售人员'
} 
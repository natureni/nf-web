// 统一类型导出文件
// 这个文件将所有类型定义集中导出，方便其他文件导入

// 项目相关类型
export type { 
  ProjectStatus, 
  PaymentStatus, 
  Project, 
  ContractService, 
  ContractInfo, 
  ExchangeRate, 
  DepartmentCost, 
  ScheduleItem, 
  TaskCell, 
  GanttProject, 
  ProjectFilters, 
  BudgetConfig, 
  ImageQuantity, 
  SystemSettings 
} from './project'

// 团队相关类型
export type { 
  Department, 
  TeamMember, 
  PaymentHistory, 
  PaymentInfo, 
  WorkloadData, 
  DepartmentStats, 
  PaymentTrendData, 
  TeamFilters 
} from './team'

// 财务相关类型
export type { 
  ProjectCost, 
  FixedCost, 
  MonthlyFinance, 
  MonthlyTrend, 
  CostStructureData, 
  TimePeriod, 
  PaymentStatusConfig, 
  FinanceFilters 
} from './finance'

// 客户相关类型
export type { 
  Client, 
  ClientFilters, 
  ProjectData, 
  ProjectHistory, 
  RegionConfig 
} from './client'

// 认证相关类型
export type { 
  UserRole, 
  PermissionModule, 
  PermissionAction, 
  User, 
  Permission, 
  RolePermissions, 
  LoginForm, 
  AuthState, 
  PermissionCheck 
} from './auth'

// 常量导出
export { DEPARTMENTS } from './team' 
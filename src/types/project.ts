// 项目状态类型
export type ProjectStatus = 'reporting' | 'modeling' | 'rendering' | 'delivering' | 'paused'

// 付款状态类型
export type PaymentStatus = 'unpaid' | 'partial' | 'completed' | 'overdue'

// 导入团队成员接口
import { TeamMember } from './team'
import { Client } from './client'

// 重新导出以保持向后兼容性
export type { TeamMember, Client }

// 项目团队成员接口（扩展TeamMember）
export interface ProjectTeamMember extends TeamMember {
  assignedWorkload?: number // 分配的工作量
  originalMember?: TeamMember // 原始团队成员信息
  imageDistribution?: {
    birdView: number
    halfBirdView: number
    humanView: number
  } // 图量分配详情（仅渲染人员使用）
}

// 项目基础接口
export interface Project {
  id: string
  name: string
  protocolNumber: string
  client: string
  status: ProjectStatus
  deadline: string
  budget: number
  currency: string
  exchangeRate: number
  budgetCNY: number
  paymentStatus: PaymentStatus
  progress: number
  type: string
  createdAt?: string
  updatedAt?: string
  completedDate?: string
  paidAmount?: number // 已付金额（当paymentStatus为'partial'时使用）
}

// 合同服务项目接口
export interface ContractService {
  camera: string
  qty: number
  unitPrice: number
  price: number
}

// 合同信息接口
export interface ContractInfo {
  project: Project
  services: ContractService[]
  discount: number
  total: number
  invoiceNumber: string
}

// 汇率接口
export interface ExchangeRate {
  currency: string
  currencyCode: string
  currencySymbol: string
  rate: number
  lastUpdated?: string
  region?: string
  flag?: string
  error?: string // 新增错误信息字段
}

// 部门成本接口
export interface DepartmentCost {
  department: string
  departmentName: string
  members: TeamMember[]
  totalCost: number
}

// 时间安排项目接口
export interface ScheduleItem {
  id: string
  phase: string
  startDate: string
  endDate: string
  color: string
  autoSchedule: boolean
  duration: number
}

// 甘特图任务单元格接口
export interface TaskCell {
  type: 'M' | 'R' | 'F' | 'P' | 'notice' | 'empty'
  count?: number
  note?: string
  animationSeconds?: number // 新增动画秒数字段
}

// 甘特图项目接口
export interface GanttProject {
  id: string
  name: string
  client: string
  status: ProjectStatus
  startDate: string
  endDate: string
  manager: string
  schedule: { [date: string]: TaskCell }
}

// 项目筛选接口
export interface ProjectFilters {
  searchText: string
  statusFilter: string
  clientFilter: string
}

// 预算配置接口
export interface BudgetConfig {
  birdViewPrice: number
  humanViewPrice: number
  animationPrice: number
  birdViewDiscount: number
  humanViewDiscount: number
  animationDiscount: number
  currency: string
}

// 图量信息接口
export interface ImageQuantity {
  birdViewCount: number
  humanViewCount: number
  animationDuration: number
}

// 系统设置接口
export interface SystemSettings {
  exchangeRates: ExchangeRate[]
  fixedExchangeRates?: ExchangeRate[]
  autoUpdate: boolean
  fixedRateMode?: boolean
  baseCurrency: string
  lastSyncTime?: string
} 
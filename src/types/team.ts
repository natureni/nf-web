// 部门配置接口
export interface Department {
  key: string
  name: string
  color: string
  maxDailyProjects: number
}

// 团队成员接口
export interface TeamMember {
  id: string
  name: string
  department: string
  phone: string
  idCard: string
  unitPrice: number // 工作量单价（按项目计算）或百分比
  priceType: 'fixed' | 'percentage' // 'fixed'表示固定单价，'percentage'表示百分比
  // 新增5种单价类型
  birdViewPrice?: number // 鸟瞰单价
  halfBirdViewPrice?: number // 半鸟瞰单价
  humanViewPrice?: number // 人视角单价
  animationPrice?: number // 动画单价（每秒）
  customPrice?: number // 自定义单价
  bankInfo: string // 打款信息
  paymentCycle: number // 出图后的打款周期时间（天）
  skills: string[]
  joinDate: string
  avatar?: string
  currentProjects: Array<{
    projectId: string
    projectName: string
    dailyWorkload: number // 每日处理项目数量
  }>
}

// 历史打款记录接口
export interface PaymentHistory {
  id: string
  memberId: string
  memberName: string
  department: string
  month: string
  projectCount: number
  totalAmount: number
  paymentDate: string
  status: 'paid' | 'pending' | 'processing'
}

// 打款信息接口
export interface PaymentInfo {
  memberId: string
  memberName: string
  department: string
  projects: Array<{
    projectId: string
    projectName: string
    projectCount: number
    amount: number
  }>
  totalAmount: number
  paymentDate: string
}

// 工作量数据接口
export interface WorkloadData {
  name: string
  current: number
  max: number
  percentage: number
}

// 部门统计接口
export interface DepartmentStats {
  department: string
  memberCount: number
  totalProjects: number
  avgWorkload: number
}

// 支付趋势数据接口
export interface PaymentTrendData {
  month: string
  amount: number
}

// 团队过滤器接口
export interface TeamFilters {
  department: string
  selectedMonth: string
}

// 部门配置常量
export const DEPARTMENTS: Department[] = [
  { key: 'manager', name: '项目经理', color: '#1890ff', maxDailyProjects: 11 },
  { key: 'modeling', name: '模型', color: '#faad14', maxDailyProjects: 5 },
  { key: 'rendering', name: '渲染', color: '#52c41a', maxDailyProjects: 3 },
  { key: 'sales', name: '销售', color: '#f5222d', maxDailyProjects: 15 }
] 
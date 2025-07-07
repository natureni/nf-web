// 项目接口定义
export interface Project {
  id: string
  name: string
  protocolNumber: string
  client: string
  status: 'reporting' | 'modeling' | 'rendering' | 'delivering'
  deadline: string
  budget: number
  paymentStatus: 'unpaid' | 'partial' | 'completed' | 'overdue'
  progress: number
  type: string
  completedDate?: string // 出图完成日期
}

// 项目成本结构
export interface ProjectCost {
  projectId: string
  projectName: string
  client: string
  totalBudget: number
  actualRevenue: number
  projectManagerCost: number  // 项目经理成本 (2%)
  modelingCost: number       // 模型成本 (按工作量)
  renderingCost: number      // 渲染成本 (按工作量)
  salesCost: number          // 销售成本 (1%)
  fixedCost: number          // 分摊固定成本
  totalCost: number
  grossProfit: number
  profitMargin: number
  expectedPaymentDate: string // 预期回款日期
  actualPaymentDate?: string
  paymentStatus: 'unpaid' | 'partial' | 'completed' | 'overdue'
}

// 固定成本结构
export interface FixedCost {
  month: string
  rent: number
  utilities: number
  software: number
  equipment: number
  insurance: number
  other: number
  total: number
}

// 月度财务数据
export interface MonthlyFinance {
  revenue: number
  cost: number
  profit: number
  profitMargin: number
}

// 月度趋势数据
export interface MonthlyTrend {
  month: string
  revenue: number
  cost: number
  profit: number
  profitRate: number
}

// 成本结构数据
export interface CostStructureData {
  name: string
  value: number
  color: string
}

// 时间维度类型
export type TimePeriod = 'month' | 'quarter' | 'halfYear' | 'year'

// 支付状态配置
export interface PaymentStatusConfig {
  color: string
  text: string
}

// 筛选器类型
export interface FinanceFilters {
  timePeriod: TimePeriod
  selectedPeriod: string
  paymentFilter: string
} 
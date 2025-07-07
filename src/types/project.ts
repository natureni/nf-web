// 汇率接口
export interface ExchangeRate {
  currency: string
  currencyCode: string
  currencySymbol: string
  rate: number
  lastUpdated?: string
  region?: string
  flag?: string
}

// 客户接口
export interface Client {
  id: string
  companyName: string
  companyNameCN: string
  contactPerson: string
  preferredCurrency: string
  projectPreferences: {
    style: string[]
    budget: string | string[]
    timeline: string | string[]
    communication: string | string[]
  }
}

// 团队成员接口
export interface TeamMember {
  id: string
  name: string
  department: string
  unitPrice: number
  priceType: 'fixed' | 'percentage'
  birdViewPrice?: number
  humanViewPrice?: number
  animationPrice?: number
  customPrice?: number
  cost?: number
  unit?: string
  assignedBirdView?: number
  assignedHumanView?: number
  assignedAnimation?: number
}

// 部门成本接口
export interface DepartmentCost {
  department: string
  departmentName: string
  members: TeamMember[]
  totalCost: number
}

// 项目接口
export interface Project {
  id: string
  name: string
  protocolNumber: string
  client: string
  status: 'reporting' | 'modeling' | 'rendering' | 'delivering'
  deadline: string
  budget: number
  currency: string
  exchangeRate: number
  budgetCNY: number
  paymentStatus: 'unpaid' | 'partial' | 'completed' | 'overdue'
  progress: number
  type: string
  createdAt?: string
  updatedAt?: string
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
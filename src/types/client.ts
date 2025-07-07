export interface Client {
  id: string
  companyName: string
  companyNameCN: string
  contactPerson: string
  contactPersonCN: string
  title: string
  titleCN: string
  email: string
  phone: string
  fax?: string
  website?: string
  businessAddress: {
    street: string
    city: string
    state: string
    postcode: string
    country: string
  }
  region: 'Asia-Pacific' | 'North-America' | 'Europe' | 'Middle-East' | 'Other'
  timezone: string
  language: string[]
  businessType: string[]
  projectPreferences: {
    style: string[]
    budget: string | string[]
    timeline: string | string[]
    communication: string | string[]
  }
  projectHistory: {
    total: number
    completed: number
    ongoing: number
    value: number
  }
  paymentInfo: {
    terms: string
    method: string
    currency: string
    creditRating: 'A' | 'B' | 'C' | 'D'
  }
  bankInfo: {
    beneficiaryBankName: string
    beneficiaryBankAddress: string
    beneficiaryBankCode: string
    swiftCode: string
    beneficiaryAccountName: string
    beneficiaryAccountNumber: string
  }
  tags: string[]
  notes: string
  status: 'active' | 'inactive' | 'potential' | 'blacklist'
  createdAt: string
  lastContact: string
}

export interface ClientFilters {
  searchText: string
  regionFilter: string
  statusFilter: string
}

export interface ProjectData {
  id: string
  client: string
  status: 'completed' | 'ongoing'
  value: number
  completedAt?: string
}

export interface ProjectHistory {
  total: number
  completed: number
  ongoing: number
  value: number
}

export type RegionConfig = {
  [key in Client['region']]: {
    text: string
    color: string
  }
} 
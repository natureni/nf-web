export interface Client {
  id: string
  companyName: string
  contactPerson: string
  titleCN: string
  email: string
  phone: string
  website?: string
  projectPreferences: {
    style: string[]
    budget: string | string[]
    timeline: string | string[]
  }
  tags: string[]
  notes: string
  status: 'active' | 'inactive' | 'potential' | 'blacklist'
  createdAt: string
  lastContact: string
}

export interface ClientFilters {
  searchText: string
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
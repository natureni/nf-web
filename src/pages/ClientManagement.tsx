import React, { useState } from 'react'
import { Card, message } from 'antd'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { Client, ClientFilters, ProjectData } from '../types/client'
import ClientSearchFilters from '../components/client/ClientSearchFilters'
import ClientTable from '../components/client/ClientTable'
import ClientDetailModal from '../components/client/ClientDetailModal'
import ClientFormModal from '../components/client/ClientFormModal'
import ClientImportModal from '../components/client/ClientImportModal'

const ClientManagement: React.FC = () => {
  const [filters, setFilters] = useState<ClientFilters>({
    searchText: '',
    regionFilter: '',
    statusFilter: ''
  })
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)

  // 模拟项目数据（实际应用中从项目管理模块获取）
  const getProjectDataForClient = (companyName: string) => {
    const allProjects: ProjectData[] = [
      { id: 'P001', client: 'URBIS', status: 'completed', value: 320000, completedAt: '2024-01-15' },
      { id: 'P002', client: 'URBIS', status: 'completed', value: 280000, completedAt: '2024-03-20' },
      { id: 'P003', client: 'URBIS', status: 'completed', value: 450000, completedAt: '2024-06-10' },
      { id: 'P004', client: 'URBIS', status: 'completed', value: 380000, completedAt: '2024-08-25' },
      { id: 'P005', client: 'URBIS', status: 'completed', value: 220000, completedAt: '2024-10-15' },
      { id: 'P006', client: 'URBIS', status: 'completed', value: 200000, completedAt: '2024-11-30' },
      { id: 'P007', client: 'URBIS', status: 'ongoing', value: 350000 },
      { id: 'P008', client: 'URBIS', status: 'ongoing', value: 400000 },
      
      { id: 'P009', client: 'Bathurst Development Corp', status: 'completed', value: 180000, completedAt: '2024-02-10' },
      { id: 'P010', client: 'Bathurst Development Corp', status: 'completed', value: 250000, completedAt: '2024-05-15' },
      { id: 'P011', client: 'Bathurst Development Corp', status: 'completed', value: 200000, completedAt: '2024-07-20' },
      { id: 'P012', client: 'Bathurst Development Corp', status: 'completed', value: 290000, completedAt: '2024-09-05' },
      { id: 'P013', client: 'Bathurst Development Corp', status: 'ongoing', value: 320000 },
      
      { id: 'P014', client: 'NCCEC Group', status: 'completed', value: 600000, completedAt: '2024-04-30' },
      { id: 'P015', client: 'NCCEC Group', status: 'ongoing', value: 800000 },
      { id: 'P016', client: 'NCCEC Group', status: 'ongoing', value: 750000 },
      
      { id: 'P017', client: 'Norwell Properties', status: 'completed', value: 150000, completedAt: '2024-03-15' },
      { id: 'P018', client: 'Norwell Properties', status: 'completed', value: 180000, completedAt: '2024-06-20' },
      { id: 'P019', client: 'Norwell Properties', status: 'completed', value: 170000, completedAt: '2024-09-10' },
      { id: 'P020', client: 'Norwell Properties', status: 'ongoing', value: 180000 },
      
      { id: 'P021', client: 'Olympic Club International', status: 'completed', value: 450000, completedAt: '2024-07-15' },
      { id: 'P022', client: 'Olympic Club International', status: 'ongoing', value: 520000 },
    ]

    const clientProjects = allProjects.filter(p => p.client === companyName)
    const completed = clientProjects.filter(p => p.status === 'completed')
    const ongoing = clientProjects.filter(p => p.status === 'ongoing')
    const total = clientProjects.length
    const totalValue = clientProjects.reduce((sum, p) => sum + p.value, 0)

    return {
      total,
      completed: completed.length,
      ongoing: ongoing.length,
      value: totalValue
    }
  }

  // 模拟客户数据
  const clients: Client[] = [
    {
      id: '1',
      companyName: 'URBIS 澳洲城市规划设计公司',
      contactPerson: 'David Johnson 大卫·约翰逊',
      title: 'Senior Partner 高级合伙人',
      email: 'david.johnson@urbis.com.au',
      phone: '+61 7 3007 3800',
      website: 'https://urbis.com.au',
      region: 'Asia-Pacific',
      timezone: 'AEST (UTC+10)',
      language: ['English', 'Mandarin'],
      businessType: ['Urban Planning', 'Property Development', 'Architecture'],
      projectPreferences: {
        style: ['Modern', 'Commercial', 'Residential High-rise'],
        budget: '$200,000 - $500,000',
        timeline: '3-6 months',
        communication: 'Email + Video Call'
      },
      projectHistory: {
        total: 8,
        completed: 6,
        ongoing: 2,
        value: 2600000
      },
      paymentInfo: {
        terms: 'Net 30',
        method: 'Wire Transfer',
        currency: 'AUD',
        creditRating: 'A'
      },
      tags: ['VIP客户', '长期合作', '大型项目'],
      notes: '重要客户，澳洲知名城市规划设计公司，项目质量要求高，付款及时。',
      status: 'active',
      createdAt: '2023-01-15',
      lastContact: '2024-12-01'
    },
    {
      id: '2',
      companyName: 'Bathurst Development Corp 巴瑟斯特开发公司',
      contactPerson: 'Sarah Mitchell 萨拉·米切尔',
      title: 'Development Manager 开发经理',
      email: 'sarah.mitchell@bathurst.com',
      phone: '+61 2 6331 8900',
      website: 'https://bathurst-development.com',
      region: 'Asia-Pacific',
      timezone: 'AEST (UTC+10)',
      language: ['English'],
      businessType: ['Real Estate', 'Commercial Development'],
      projectPreferences: {
        style: ['Contemporary', 'Mixed-use'],
        budget: '$150,000 - $300,000',
        timeline: '2-4 months',
        communication: 'Email + Phone'
      },
      projectHistory: {
        total: 5,
        completed: 4,
        ongoing: 1,
        value: 1240000
      },
      paymentInfo: {
        terms: 'Net 45',
        method: 'Bank Transfer',
        currency: 'AUD',
        creditRating: 'B'
      },
      tags: ['中型项目', '稳定客户'],
      notes: '地区性开发商，项目规模适中，合作关系良好。',
      status: 'active',
      createdAt: '2023-03-20',
      lastContact: '2024-11-28'
    },
    {
      id: '3',
      companyName: 'NCCEC Group 中国建筑工程集团',
      contactPerson: 'Wang Lei 王磊',
      title: 'Project Director 项目总监',
      email: 'wang.lei@nccec.com.cn',
      phone: '+86 10 8888 9999',
      website: 'https://nccec.com.cn',
      region: 'Asia-Pacific',
      timezone: 'CST (UTC+8)',
      language: ['Mandarin', 'English'],
      businessType: ['Architecture', 'Public Architecture', 'Cultural Buildings'],
      projectPreferences: {
        style: ['Grand', 'Cultural', 'Exhibition'],
        budget: '$500,000+',
        timeline: '6-12 months',
        communication: 'WeChat + Email'
      },
      projectHistory: {
        total: 3,
        completed: 1,
        ongoing: 2,
        value: 2150000
      },
      paymentInfo: {
        terms: 'Net 60',
        method: 'Wire Transfer',
        currency: 'CNY',
        creditRating: 'A'
      },
      tags: ['国际客户', '大型项目', '文化建筑'],
      notes: '中国大型建筑集团，主要承接文化建筑和公共建筑项目。',
      status: 'active',
      createdAt: '2023-06-10',
      lastContact: '2024-11-25'
    },
    {
      id: '4',
      companyName: 'Norwell Properties 诺威尔地产',
      contactPerson: 'Michael Chen 陈迈克',
      title: 'CEO 首席执行官',
      email: 'michael.chen@norwell.com',
      phone: '+1 604 123 4567',
      website: 'https://norwell-properties.com',
      region: 'North-America',
      timezone: 'PST (UTC-8)',
      language: ['English', 'Mandarin'],
      businessType: ['Real Estate', 'Residential'],
      projectPreferences: {
        style: ['Resort', 'Luxury Residential'],
        budget: '$100,000 - $250,000',
        timeline: '2-3 months',
        communication: 'Email + Video Call'
      },
      projectHistory: {
        total: 4,
        completed: 3,
        ongoing: 1,
        value: 680000
      },
      paymentInfo: {
        terms: 'Net 30',
        method: 'Wire Transfer',
        currency: 'CAD',
        creditRating: 'A'
      },
      tags: ['度假项目', '豪华住宅', '美国客户'],
      notes: '专注于度假村和豪华住宅项目的北美开发商。',
      status: 'active',
      createdAt: '2023-08-15',
      lastContact: '2024-11-30'
    },
    {
      id: '5',
      companyName: 'Olympic Club International 奥林匹克俱乐部国际',
      contactPerson: 'Robert Taylor 罗伯特·泰勒',
      title: 'Facilities Manager 设施经理',
      email: 'robert.taylor@olympic-club.com',
      phone: '+1 415 555 0123',
      website: 'https://olympic-club.com',
      region: 'North-America',
      timezone: 'PST (UTC-8)',
      language: ['English'],
      businessType: ['Sports Facilities', 'Recreation', 'Entertainment'],
      projectPreferences: {
        style: ['Sports', 'Functional'],
        budget: '$300,000 - $600,000',
        timeline: '4-8 months',
        communication: 'Phone + Email'
      },
      projectHistory: {
        total: 2,
        completed: 1,
        ongoing: 1,
        value: 970000
      },
      paymentInfo: {
        terms: 'Net 15',
        method: 'ACH Transfer',
        currency: 'USD',
        creditRating: 'A'
      },
      tags: ['体育设施', '娱乐业', '美国客户'],
      notes: '历史悠久的体育俱乐部，专注于体育设施和娱乐场所的开发。',
      status: 'active',
      createdAt: '2023-10-05',
      lastContact: '2024-11-20'
    }
  ]

  // 过滤数据
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(filters.searchText.toLowerCase()) ||
                         client.contactPerson.toLowerCase().includes(filters.searchText.toLowerCase())
    const matchesRegion = !filters.regionFilter || client.region === filters.regionFilter
    const matchesStatus = !filters.statusFilter || client.status === filters.statusFilter
    return matchesSearch && matchesRegion && matchesStatus
  })

  // 处理事件
  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setDetailModalVisible(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setEditModalVisible(true)
  }

  const handleDeleteClient = (client: Client) => {
    // 实际应用中这里会调用API删除客户
    console.log('删除客户:', client.id)
  }

  const handleCreateClient = () => {
    setSelectedClient(null)
    setCreateModalVisible(true)
  }

  const handleImportClients = () => {
    setImportModalVisible(true)
  }

  const handleClientSubmit = (values: any) => {
    if (selectedClient) {
      // 更新客户
      console.log('更新客户:', values)
      message.success('客户信息更新成功')
    } else {
      // 创建新客户
      const newClient = {
        ...values,
        id: Date.now().toString(),
        createdAt: dayjs().format('YYYY-MM-DD'),
        lastContact: dayjs().format('YYYY-MM-DD')
      }
      console.log('创建客户:', newClient)
      message.success('客户创建成功')
    }
  }

  const handleUpdateProjectHistory = (companyName: string) => {
    const projectData = getProjectDataForClient(companyName)
    message.success(`已自动更新 ${companyName} 的项目历史数据`)
    return projectData
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        console.log('导入数据:', jsonData)
        message.success(`成功导入 ${jsonData.length} 条客户记录`)
        setImportModalVisible(false)
      } catch (error) {
        message.error('文件解析失败，请检查文件格式')
      }
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <ClientSearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onCreateClient={handleCreateClient}
          onImportClients={handleImportClients}
        />
        
        <ClientTable
          clients={filteredClients}
          onViewClient={handleViewClient}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
        />
      </Card>

      <ClientDetailModal
        visible={detailModalVisible}
        client={selectedClient}
        onClose={() => setDetailModalVisible(false)}
      />

      <ClientFormModal
        visible={editModalVisible}
        client={selectedClient}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleClientSubmit}
        onUpdateProjectHistory={handleUpdateProjectHistory}
      />

      <ClientFormModal
        visible={createModalVisible}
        client={null}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleClientSubmit}
        onUpdateProjectHistory={handleUpdateProjectHistory}
      />

      <ClientImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImport={handleImport}
      />
    </div>
  )
}

export default ClientManagement 
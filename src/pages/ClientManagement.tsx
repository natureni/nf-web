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
    statusFilter: ''
  })
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)

  // 获取项目数据（用于同步客户项目历史）
  const getProjectDataForClient = (companyName: string): ProjectData => {
    // 模拟从项目管理模块获取数据
    const mockProjectData: ProjectData = {
      total: Math.floor(Math.random() * 10) + 1,
      completed: Math.floor(Math.random() * 8) + 1,
      ongoing: Math.floor(Math.random() * 3) + 1,
      totalValue: Math.floor(Math.random() * 1000000) + 100000
    }
    return mockProjectData
  }

  // 模拟客户数据
  const clients: Client[] = [
    {
      id: '1',
      companyName: 'URBIS 澳洲城市规划设计公司',
      contactPerson: 'David Johnson 大卫·约翰逊',
      titleCN: '高级合伙人',
      email: 'david.johnson@urbis.com.au',
      phone: '+61 7 3007 3800',
      website: 'https://urbis.com.au',
      projectPreferences: {
        style: ['Modern', 'Commercial', 'Residential High-rise'],
        budget: '$200,000 - $500,000',
        timeline: '3-6 months'
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
      titleCN: '开发经理',
      email: 'sarah.mitchell@bathurst.com',
      phone: '+61 2 6331 8900',
      website: 'https://bathurst-development.com',
      projectPreferences: {
        style: ['Contemporary', 'Mixed-use'],
        budget: '$150,000 - $300,000',
        timeline: '2-4 months'
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
      titleCN: '项目总监',
      email: 'wang.lei@nccec.com.cn',
      phone: '+86 10 8888 9999',
      website: 'https://nccec.com.cn',
      projectPreferences: {
        style: ['Grand', 'Cultural', 'Exhibition'],
        budget: '$500,000+',
        timeline: '6-12 months'
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
      titleCN: '首席执行官',
      email: 'michael.chen@norwell.com',
      phone: '+1 604 123 4567',
      website: 'https://norwell-properties.com',
      projectPreferences: {
        style: ['Resort', 'Luxury Residential'],
        budget: '$100,000 - $250,000',
        timeline: '2-3 months'
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
      titleCN: '设施经理',
      email: 'robert.taylor@olympic-club.com',
      phone: '+1 415 555 0123',
      website: 'https://olympic-club.com',
      projectPreferences: {
        style: ['Sports', 'Functional'],
        budget: '$300,000 - $600,000',
        timeline: '4-8 months'
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
    const matchesStatus = !filters.statusFilter || client.status === filters.statusFilter
    return matchesSearch && matchesStatus
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
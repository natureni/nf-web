import React, { useState } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Tooltip,
  Card,
  Row,
  Col,
  Avatar,
  Descriptions,
  Tabs,
  Progress,
  Statistic,
  Divider,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  BankOutlined,
  HeartOutlined,
  ProjectOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

interface Client {
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

const ClientManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 模拟项目数据（实际应用中从项目管理模块获取）
  const getProjectDataForClient = (companyName: string) => {
    // 模拟从项目管理系统获取的项目数据
    const allProjects = [
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

  // 自动更新客户项目历史数据
  const updateClientProjectHistory = (clientName: string) => {
    const projectData = getProjectDataForClient(clientName)
    form.setFieldsValue({
      projectHistory: projectData
    })
    message.success(`已自动更新 ${clientName} 的项目历史数据`)
  }

  // Excel模板下载
  const downloadTemplate = () => {
    const templateData = [
      {
        '公司名称(英文)*': 'Company Name Ltd',
        '公司名称(中文)': '公司中文名',
        '联系人(英文)*': 'Contact Person',
        '联系人(中文)': '联系人中文名',
        '职位(英文)': 'Job Title',
        '职位(中文)': '职位中文',
        '邮箱*': 'email@company.com',
        '电话': '+61 7 3007 3800',
        '传真': '+61 7 3007 3801',
        '网站': 'https://company.com',
        '企业注册地址-街道*': 'Level 15, 500 Queen Street',
        '企业注册地址-城市*': 'Brisbane',
        '企业注册地址-州/省': 'QLD',
        '企业注册地址-邮编': '4000',
        '企业注册地址-国家*': 'Australia',
        '地区': 'Asia-Pacific',
        '时区': 'AEST (UTC+10)',
        '语言': 'English,Mandarin',
        '业务类型': 'Real Estate,Commercial Development',
        '风格偏好': 'Modern,Commercial,Residential High-rise',
        '预算范围': '$200,000 - $500,000',
        '时间周期': '3-6 months',
        '沟通方式': 'Email + Video Call',
        '付款条款': 'Net 30',
        '付款方式': 'Wire Transfer',
        '币种': 'AUD',
        '信用评级': 'A',
        '受益人银行名称*': 'Commonwealth Bank of Australia',
        '受益人银行地址*': '240 Queen Street, Brisbane QLD 4000',
        '受益人银行代码*': '062',
        'SWIFT代码*': 'CTBAAU2S',
        '受益人账户名称*': 'Company Name Pty Ltd',
        '受益人账户号码*': '062-001-12345678',
        '标签': 'VIP客户,长期合作',
        '备注': '重要客户说明信息',
        '状态': 'active'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '客户信息模板')
    
    // 设置列宽
    const wscols = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, 
      { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 10 }
    ]
    ws['!cols'] = wscols

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, `客户信息导入模板_${dayjs().format('YYYYMMDD')}.xlsx`)
    message.success('Excel模板下载成功')
  }

  // 批量导入处理
  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        console.log('导入的数据:', jsonData)
        message.success(`成功导入 ${jsonData.length} 条客户记录`)
        setImportModalVisible(false)
      } catch (error) {
        console.error('导入失败:', error)
        message.error('文件格式错误，请使用正确的Excel模板')
      }
    }
    reader.readAsBinaryString(file)
    return false // 阻止自动上传
  }

  // 客户数据
  const [clients] = useState<Client[]>([
    {
      id: 'CL001',
      companyName: 'URBIS',
      companyNameCN: '欧贝思咨询公司',
      contactPerson: 'John Smith',
      contactPersonCN: '约翰·史密斯',
      title: 'Project Director',
      titleCN: '项目总监',
      email: 'john.smith@urbis.com.au',
      phone: '+61 7 3007 3800',
      fax: '+61 7 3007 3801',
      website: 'https://urbis.com.au',
      businessAddress: {
        street: 'Level 15, 500 Queen Street',
        city: 'Brisbane',
        state: 'QLD',
        postcode: '4000',
        country: 'Australia'
      },
      region: 'Asia-Pacific',
      timezone: 'AEST (UTC+10)',
      language: ['English'],
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
        value: 1850000
      },
      paymentInfo: {
        terms: 'Net 30',
        method: 'Wire Transfer',
        currency: 'AUD',
        creditRating: 'A'
      },
      bankInfo: {
        beneficiaryBankName: 'Commonwealth Bank of Australia',
        beneficiaryBankAddress: '240 Queen Street, Brisbane QLD 4000',
        beneficiaryBankCode: '062',
        swiftCode: 'CTBAAU2S',
        beneficiaryAccountName: 'URBIS Pty Ltd',
        beneficiaryAccountNumber: '062-001-12345678'
      },
      tags: ['VIP客户', '长期合作', '大型项目'],
      notes: '重要客户，项目质量要求高，付款及时，合作关系良好',
      status: 'active',
      createdAt: '2022-03-15',
      lastContact: '2024-12-20'
    },
    {
      id: 'CL002',
      companyName: 'Bathurst Development Corp',
      companyNameCN: '巴瑟斯特开发公司',
      contactPerson: 'Sarah Wilson',
      contactPersonCN: '莎拉·威尔逊',
      title: 'Development Manager',
      titleCN: '开发经理',
      email: 'sarah.wilson@bathurst-dev.com',
      phone: '+61 2 9876 5432',
      website: 'https://bathurst-dev.com',
      businessAddress: {
        street: '100 Bathurst Street',
        city: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        country: 'Australia'
      },
      region: 'Asia-Pacific',
      timezone: 'AEST (UTC+10)',
      language: ['English', 'Mandarin'],
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
        value: 920000
      },
      paymentInfo: {
        terms: 'Net 45',
        method: 'Bank Transfer',
        currency: 'AUD',
        creditRating: 'B'
      },
      bankInfo: {
        beneficiaryBankName: 'Westpac Banking Corporation',
        beneficiaryBankAddress: '60 Martin Place, Sydney NSW 2000',
        beneficiaryBankCode: '032',
        swiftCode: 'WPACAU2S',
        beneficiaryAccountName: 'Bathurst Development Corp Pty Ltd',
        beneficiaryAccountNumber: '032-056-87654321'
      },
      tags: ['中型项目', '稳定客户'],
      notes: '注重成本控制，喜欢现代简约风格',
      status: 'active',
      createdAt: '2023-01-10',
      lastContact: '2024-12-18'
    },
    {
      id: 'CL003',
      companyName: 'NCCEC Group',
      companyNameCN: 'NCCEC集团',
      contactPerson: 'David Chen',
      contactPersonCN: '陈大卫',
      title: 'Chief Architect',
      titleCN: '首席建筑师',
      email: 'd.chen@nccec.com',
      phone: '+86 21 6234 5678',
      website: 'https://nccec.com',
      businessAddress: {
        street: '1188 Century Avenue, Floor 18',
        city: 'Shanghai',
        state: 'Shanghai',
        postcode: '200120',
        country: 'China'
      },
      region: 'Asia-Pacific',
      timezone: 'CST (UTC+8)',
      language: ['Mandarin', 'English'],
      businessType: ['Exhibition Center', 'Cultural Buildings', 'Public Architecture'],
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
        value: 1200000
      },
      paymentInfo: {
        terms: 'Net 60',
        method: 'Wire Transfer',
        currency: 'USD',
        creditRating: 'A'
      },
      bankInfo: {
        beneficiaryBankName: 'The Hongkong and Shanghai Banking Corporation Limited',
        beneficiaryBankAddress: '1 Queen\'s Road Central Hong Kong',
        beneficiaryBankCode: '004',
        swiftCode: 'HSBCHKHHHKH',
        beneficiaryAccountName: 'NCCEC Group Technology Co., Limited',
        beneficiaryAccountNumber: '149 - 291346 - 838'
      },
      tags: ['国际客户', '大型项目', '文化建筑'],
      notes: '中国大型展览中心项目，要求高端大气，注重文化内涵',
      status: 'active',
      createdAt: '2023-06-20',
      lastContact: '2024-12-15'
    },
    {
      id: 'CL004',
      companyName: 'Norwell Properties',
      companyNameCN: '诺威尔置业',
      contactPerson: 'Michael Johnson',
      contactPersonCN: '迈克尔·约翰逊',
      title: 'Property Manager',
      titleCN: '物业经理',
      email: 'mjohnson@norwell.com',
      phone: '+61 7 5555 1234',
      businessAddress: {
        street: '500 Gold Coast Highway, Suite 12',
        city: 'Gold Coast',
        state: 'QLD',
        postcode: '4217',
        country: 'Australia'
      },
      region: 'Asia-Pacific',
      timezone: 'AEST (UTC+10)',
      language: ['English'],
      businessType: ['Residential', 'Tourism', 'Hospitality'],
      projectPreferences: {
        style: ['Resort', 'Luxury Residential'],
        budget: '$100,000 - $250,000',
        timeline: '2-3 months',
        communication: 'Phone + Email'
      },
      projectHistory: {
        total: 4,
        completed: 3,
        ongoing: 1,
        value: 680000
      },
      paymentInfo: {
        terms: 'Net 30',
        method: 'Credit Card',
        currency: 'AUD',
        creditRating: 'B'
      },
      bankInfo: {
        beneficiaryBankName: 'ANZ Bank',
        beneficiaryBankAddress: '324 Queen Street, Brisbane QLD 4000',
        beneficiaryBankCode: '013',
        swiftCode: 'ANZBAU3M',
        beneficiaryAccountName: 'Norwell Properties Pty Ltd',
        beneficiaryAccountNumber: '013-789-98765432'
      },
      tags: ['度假项目', '豪华住宅'],
      notes: '专注于度假村和豪华住宅项目，重视视觉效果',
      status: 'active',
      createdAt: '2023-09-12',
      lastContact: '2024-12-10'
    },
    {
      id: 'CL005',
      companyName: 'Olympic Club International',
      companyNameCN: '奥林匹克俱乐部国际',
      contactPerson: 'Emma Thompson',
      contactPersonCN: '艾玛·汤普森',
      title: 'Facilities Director',
      titleCN: '设施总监',
      email: 'ethompson@olympicclub.com',
      phone: '+1 415 555 0123',
      businessAddress: {
        street: '150 Olympic Boulevard, Floor 8',
        city: 'San Francisco',
        state: 'CA',
        postcode: '94102',
        country: 'United States'
      },
      region: 'North-America',
      timezone: 'PST (UTC-8)',
      language: ['English'],
      businessType: ['Sports Facilities', 'Recreation', 'Entertainment'],
      projectPreferences: {
        style: ['Sports', 'Modern', 'Functional'],
        budget: '$300,000 - $600,000',
        timeline: '4-8 months',
        communication: 'Video Call + Email'
      },
      projectHistory: {
        total: 2,
        completed: 1,
        ongoing: 1,
        value: 750000
      },
      paymentInfo: {
        terms: 'Net 30',
        method: 'ACH Transfer',
        currency: 'USD',
        creditRating: 'A'
      },
      bankInfo: {
        beneficiaryBankName: 'Bank of America',
        beneficiaryBankAddress: '555 California Street, San Francisco CA 94104',
        beneficiaryBankCode: '121000358',
        swiftCode: 'BOFAUS3N',
        beneficiaryAccountName: 'Olympic Club International Inc.',
        beneficiaryAccountNumber: '123456789012'
      },
      tags: ['体育设施', '美国客户'],
      notes: '体育设施专业客户，注重功能性和现代感',
      status: 'active',
      createdAt: '2024-02-28',
      lastContact: '2024-12-22'
    }
  ])

  // 地区配置
  const regionConfig = {
    'Asia-Pacific': { color: '#52c41a', text: '亚太地区' },
    'North-America': { color: '#1890ff', text: '北美地区' },
    'Europe': { color: '#722ed1', text: '欧洲地区' },
    'Middle-East': { color: '#fa8c16', text: '中东地区' },
    'Other': { color: '#8c8c8c', text: '其他地区' }
  }

  // 状态配置
  const statusConfig = {
    active: { color: '#52c41a', text: '活跃客户' },
    inactive: { color: '#d9d9d9', text: '非活跃' },
    potential: { color: '#1890ff', text: '潜在客户' },
    blacklist: { color: '#ff4d4f', text: '黑名单' }
  }

  // 信用评级配置
  const creditConfig = {
    A: { color: '#52c41a', text: '优秀' },
    B: { color: '#1890ff', text: '良好' },
    C: { color: '#fa8c16', text: '一般' },
    D: { color: '#ff4d4f', text: '较差' }
  }

  // 表格列定义
  const columns: ColumnsType<Client> = [
    {
      title: '公司信息 / Company Info',
      key: 'company',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            size={40} 
            style={{ background: '#1890ff' }}
            icon={<BankOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {record.companyName}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.companyNameCN}
            </div>
            <div style={{ fontSize: 11, color: '#1890ff' }}>
              {record.contactPerson} / {record.contactPersonCN}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '地址 / Address',
      key: 'address',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>
            {record.businessAddress.city}, {record.businessAddress.country}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.businessAddress.street}
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {record.businessAddress.state} {record.businessAddress.postcode}
          </div>
        </div>
      ),
    },
    {
      title: '地区 / Region',
      dataIndex: 'region',
      width: 120,
      filters: Object.entries(regionConfig).map(([key, config]) => ({
        text: config.text,
        value: key
      })),
      onFilter: (value, record) => record.region === value,
      render: (region) => {
        const config = regionConfig[region as keyof typeof regionConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '项目统计 / Projects',
      key: 'projects',
      width: 130,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            总计 {record.projectHistory.total} 个
          </div>
          <div style={{ fontSize: 11, color: '#52c41a' }}>
            完成 {record.projectHistory.completed}
          </div>
          <div style={{ fontSize: 11, color: '#1890ff' }}>
            进行中 {record.projectHistory.ongoing}
          </div>
        </div>
      ),
    },
    {
      title: '项目价值 / Value',
      key: 'value',
      width: 120,
      sorter: (a, b) => a.projectHistory.value - b.projectHistory.value,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff' }}>
            ${record.projectHistory.value.toLocaleString()}
          </div>
          <Tag color={creditConfig[record.paymentInfo.creditRating].color}>
            {creditConfig[record.paymentInfo.creditRating].text}
          </Tag>
        </div>
      ),
    },
    {
      title: '状态 / Status',
      dataIndex: 'status',
      width: 100,
      filters: Object.entries(statusConfig).map(([key, config]) => ({
        text: config.text,
        value: key
      })),
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '操作 / Actions',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                setSelectedClient(record)
                setDetailModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="编辑客户">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setSelectedClient(record)
                form.setFieldsValue(record)
                setEditModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="删除客户">
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除客户"${record.companyName}"吗？`,
                  okText: '删除',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: () => message.success('客户删除成功'),
                })
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // 过滤数据
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
                         client.companyNameCN.includes(searchText) ||
                         client.contactPerson.toLowerCase().includes(searchText.toLowerCase()) ||
                         client.contactPersonCN.includes(searchText)
    const matchesRegion = !regionFilter || client.region === regionFilter
    const matchesStatus = !statusFilter || client.status === statusFilter
    return matchesSearch && matchesRegion && matchesStatus
  })

  // 渲染客户详情
  const renderClientDetail = () => {
    if (!selectedClient) return null

    return (
      <Tabs defaultActiveKey="basic" size="large">
        <TabPane tab="基本信息 / Basic Info" key="basic">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="公司名称 / Company" span={2}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{selectedClient.companyName}</div>
                <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{selectedClient.companyNameCN}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="联系人 / Contact">
              <div>
                <div style={{ fontWeight: 500 }}>{selectedClient.contactPerson}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{selectedClient.contactPersonCN}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="职位 / Title">
              <div>
                <div>{selectedClient.title}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{selectedClient.titleCN}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="邮箱 / Email">
              <a href={`mailto:${selectedClient.email}`}>{selectedClient.email}</a>
            </Descriptions.Item>
            <Descriptions.Item label="电话 / Phone">
              <a href={`tel:${selectedClient.phone}`}>{selectedClient.phone}</a>
            </Descriptions.Item>
            <Descriptions.Item label="传真 / Fax">
              {selectedClient.fax || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="网站 / Website">
              {selectedClient.website ? (
                <a href={selectedClient.website} target="_blank" rel="noopener noreferrer">
                  {selectedClient.website}
                </a>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="地区 / Region">
              <Tag color={regionConfig[selectedClient.region].color}>
                {regionConfig[selectedClient.region].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="时区 / Timezone">
              {selectedClient.timezone}
            </Descriptions.Item>
            <Descriptions.Item label="语言 / Languages">
              {selectedClient.language.map(lang => (
                <Tag key={lang} color="blue" style={{ marginBottom: 4 }}>{lang}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="业务类型 / Business Type">
              {selectedClient.businessType.map(type => (
                <Tag key={type} color="green" style={{ marginBottom: 4 }}>
                  {type}
                </Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="企业地址 / Business Address" key="address">
          <Card size="small" title="企业注册地址 / Business Registration Address">
            <Descriptions column={1} size="middle" bordered>
              <Descriptions.Item label="完整地址 / Full Address">
                <div style={{ lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 500 }}>{selectedClient.businessAddress.street}</div>
                  <div>{selectedClient.businessAddress.city}, {selectedClient.businessAddress.state} {selectedClient.businessAddress.postcode}</div>
                  <div style={{ color: '#1890ff', fontWeight: 500 }}>{selectedClient.businessAddress.country}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="街道地址 / Street Address">
                {selectedClient.businessAddress.street}
              </Descriptions.Item>
              <Descriptions.Item label="城市 / City">
                {selectedClient.businessAddress.city}
              </Descriptions.Item>
              <Descriptions.Item label="州/省 / State">
                {selectedClient.businessAddress.state}
              </Descriptions.Item>
              <Descriptions.Item label="邮编 / Postcode">
                {selectedClient.businessAddress.postcode}
              </Descriptions.Item>
              <Descriptions.Item label="国家 / Country">
                {selectedClient.businessAddress.country}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab="项目偏好 / Preferences" key="preferences">
          <Card size="small" title="项目偏好设置 / Project Preferences">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="风格偏好 / Style Preferences">
                <div style={{ marginTop: 8 }}>
                  {selectedClient.projectPreferences.style.map(style => (
                    <Tag key={style} color="purple" icon={<HeartOutlined />} style={{ marginBottom: 4 }}>
                      {style}
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="预算范围 / Budget Range">
                <Tag color="gold" style={{ fontSize: 13 }}>
                  {Array.isArray(selectedClient.projectPreferences.budget) 
                    ? selectedClient.projectPreferences.budget.join(', ') 
                    : selectedClient.projectPreferences.budget}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="时间周期 / Timeline">
                <Tag color="cyan" style={{ fontSize: 13 }}>
                  {Array.isArray(selectedClient.projectPreferences.timeline) 
                    ? selectedClient.projectPreferences.timeline.join(', ') 
                    : selectedClient.projectPreferences.timeline}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="沟通方式 / Communication">
                <Tag color="orange" style={{ fontSize: 13 }}>
                  {Array.isArray(selectedClient.projectPreferences.communication) 
                    ? selectedClient.projectPreferences.communication.join(', ') 
                    : selectedClient.projectPreferences.communication}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab="项目历史 / Project History" key="history">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic 
                title="总项目数 / Total Projects" 
                value={selectedClient.projectHistory.total}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="完成项目 / Completed" 
                value={selectedClient.projectHistory.completed}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="进行中 / Ongoing" 
                value={selectedClient.projectHistory.ongoing}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="项目总价值 / Total Value" 
                value={selectedClient.projectHistory.value}
                precision={0}
                prefix="$"
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="circle" 
                  percent={Math.round((selectedClient.projectHistory.completed / selectedClient.projectHistory.total) * 100)}
                  format={(percent) => `完成率 ${percent}%`}
                  strokeColor="#52c41a"
                  size={120}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="circle" 
                  percent={Math.round((selectedClient.projectHistory.ongoing / selectedClient.projectHistory.total) * 100)}
                  format={(percent) => `进行中 ${percent}%`}
                  strokeColor="#fa8c16"
                  size={120}
                />
              </div>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="财务信息 / Payment Info" key="payment">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card size="small" title="付款信息 / Payment Information">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="付款条款 / Payment Terms">
                    <Tag color="blue">{selectedClient.paymentInfo.terms}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="付款方式 / Payment Method">
                    <Tag color="green">{selectedClient.paymentInfo.method}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="币种 / Currency">
                    <Tag color="orange">{selectedClient.paymentInfo.currency}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="信用评级 / Credit Rating">
                    <Tag color={creditConfig[selectedClient.paymentInfo.creditRating].color}>
                      {selectedClient.paymentInfo.creditRating} - {creditConfig[selectedClient.paymentInfo.creditRating].text}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card size="small" title="客户标签和备注 / Tags & Notes">
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>客户标签 / Tags:</div>
                  <div>
                    {selectedClient.tags.map(tag => (
                      <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>{tag}</Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>备注信息 / Notes:</div>
                  <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4, lineHeight: 1.6 }}>
                    {selectedClient.notes}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="银行信息 / Bank Info" key="bank">
          <Card size="small" title="银行转账信息 / Wire Transfer Information">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="受益人银行名称 / Beneficiary Bank Name">
                <div style={{ fontWeight: 500, fontSize: 15, color: '#1890ff' }}>
                  {selectedClient.bankInfo.beneficiaryBankName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="受益人银行地址 / Beneficiary Bank Address">
                {selectedClient.bankInfo.beneficiaryBankAddress}
              </Descriptions.Item>
              <Descriptions.Item label="受益人银行代码 / Beneficiary Bank Code">
                <Tag color="blue" style={{ fontSize: 13, fontFamily: 'monospace' }}>
                  {selectedClient.bankInfo.beneficiaryBankCode}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="SWIFT代码 / SWIFT Code">
                <Tag color="green" style={{ fontSize: 13, fontFamily: 'monospace' }}>
                  {selectedClient.bankInfo.swiftCode}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="受益人账户名称 / Beneficiary Account Name">
                <div style={{ fontWeight: 500, fontSize: 15 }}>
                  {selectedClient.bankInfo.beneficiaryAccountName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="受益人账户号码 / Beneficiary Account Number">
                <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 500, color: '#722ed1' }}>
                  {selectedClient.bankInfo.beneficiaryAccountNumber}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
      </Tabs>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>客户管理 / Client Management</h1>
            <p style={{ color: '#8c8c8c', marginTop: 8 }}>
              管理客户信息、项目历史和业务关系 / Manage client information, project history and business relationships
            </p>
          </div>
          <Space size={12}>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={downloadTemplate}
            >
              下载模板
            </Button>
            <Button 
              icon={<UploadOutlined />} 
              onClick={() => setImportModalVisible(true)}
            >
              批量导入
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large"
              onClick={() => {
                form.resetFields()
                setCreateModalVisible(true)
              }}
            >
              新增客户 / Add Client
            </Button>
          </Space>
        </div>
      </div>

      <div className="content-wrapper">
        {/* 搜索和筛选 */}
        <div style={{ 
          marginBottom: 24, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 16 
        }}>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <Input
              placeholder="搜索公司名称、联系人..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </div>
          
          <Space size={12}>
            <Select
              placeholder="全部地区"
              allowClear
              value={regionFilter}
              onChange={setRegionFilter}
              style={{ width: 140 }}
              size="large"
            >
              {Object.entries(regionConfig).map(([key, config]) => (
                <Option key={key} value={key}>{config.text}</Option>
              ))}
            </Select>

            <Select
              placeholder="全部状态"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              size="large"
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Option key={key} value={key}>{config.text}</Option>
              ))}
            </Select>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总客户数 / Total Clients"
                value={filteredClients.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃客户 / Active Clients"
                value={filteredClients.filter(c => c.status === 'active').length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总项目价值 / Total Value"
                value={filteredClients.reduce((sum, c) => sum + c.projectHistory.value, 0)}
                precision={0}
                prefix="$"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均项目价值 / Avg Value"
                value={Math.round(filteredClients.reduce((sum, c) => sum + c.projectHistory.value, 0) / filteredClients.length || 0)}
                precision={0}
                prefix="$"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 客户表格 */}
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          pagination={{
            total: filteredClients.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `显示 ${range[0]}-${range[1]} 条记录，共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1400 }}
          size="middle"
          style={{
            background: '#fff',
            borderRadius: '8px',
          }}
        />
      </div>

      {/* 客户详情模态框 */}
      <Modal
        title={selectedClient ? `${selectedClient.companyName} - 客户详情` : '客户详情'}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setDetailModalVisible(false)
              if (selectedClient) {
                form.setFieldsValue(selectedClient)
                setEditModalVisible(true)
              }
            }}
          >
            编辑客户
          </Button>,
        ]}
      >
        {renderClientDetail()}
      </Modal>

      {/* 编辑/新增客户模态框 */}
      <Modal
        title={selectedClient ? "编辑客户" : "新增客户"}
        open={editModalVisible || createModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setCreateModalVisible(false)
          setSelectedClient(null)
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditModalVisible(false)
            setCreateModalVisible(false)
            setSelectedClient(null)
          }}>
            取消
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={() => {
              message.success('客户信息保存成功')
              setEditModalVisible(false)
              setCreateModalVisible(false)
              setSelectedClient(null)
            }}
          >
            保存
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="公司名称 (英文) *" name={['companyName']} rules={[{ required: true, message: '请输入公司名称' }]}>
                <Input placeholder="Company Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="公司名称 (中文)" name={['companyNameCN']}>
                <Input placeholder="公司中文名" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系人 (英文) *" name={['contactPerson']} rules={[{ required: true, message: '请输入联系人姓名' }]}>
                <Input placeholder="Contact Person" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系人 (中文)" name={['contactPersonCN']}>
                <Input placeholder="联系人中文名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="职位 (英文)" name={['title']}>
                <Input placeholder="Job Title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="职位 (中文)" name={['titleCN']}>
                <Input placeholder="职位中文" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="邮箱 *" name={['email']} rules={[{ required: true, type: 'email', message: '请输入正确的邮箱地址' }]}>
                <Input placeholder="email@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="电话" name={['phone']}>
                <Input placeholder="+61 7 3007 3800" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="传真" name={['fax']}>
                <Input placeholder="+61 7 3007 3801" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="网站" name={['website']}>
                <Input placeholder="https://company.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="地区" name={['region']}>
                <Select placeholder="选择地区">
                  {Object.entries(regionConfig).map(([key, config]) => (
                    <Option key={key} value={key}>{config.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="时区" name={['timezone']}>
                <Input placeholder="AEST (UTC+10)" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">企业注册地址 *</Divider>

          <Form.Item label="企业注册街道地址 *" name={['businessAddress', 'street']} rules={[{ required: true, message: '请输入企业注册街道地址' }]}>
            <Input placeholder="Level 15, 500 Queen Street" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="注册城市 *" name={['businessAddress', 'city']} rules={[{ required: true, message: '请输入注册城市' }]}>
                <Input placeholder="Brisbane" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="注册州/省" name={['businessAddress', 'state']}>
                <Input placeholder="QLD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="注册邮编" name={['businessAddress', 'postcode']}>
                <Input placeholder="4000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="注册国家 *" name={['businessAddress', 'country']} rules={[{ required: true, message: '请输入注册国家' }]}>
            <Input placeholder="Australia" />
          </Form.Item>

          <Divider orientation="left">项目偏好设置</Divider>

          <Form.Item label="风格偏好" name={['projectPreferences', 'style']}>
            <Select mode="tags" placeholder="输入风格偏好后回车添加，支持自定义">
              <Option value="Modern">Modern 现代</Option>
              <Option value="Commercial">Commercial 商业</Option>
              <Option value="Residential High-rise">Residential High-rise 高层住宅</Option>
              <Option value="Contemporary">Contemporary 当代</Option>
              <Option value="Mixed-use">Mixed-use 混合用途</Option>
              <Option value="Grand">Grand 宏伟</Option>
              <Option value="Cultural">Cultural 文化</Option>
              <Option value="Exhibition">Exhibition 展览</Option>
              <Option value="Resort">Resort 度假村</Option>
              <Option value="Luxury Residential">Luxury Residential 豪华住宅</Option>
              <Option value="Sports">Sports 体育</Option>
              <Option value="Functional">Functional 功能性</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="预算范围" name={['projectPreferences', 'budget']}>
                <Select placeholder="选择预算范围或自定义输入" mode="tags" allowClear>
                  <Option value="$50,000 - $100,000">$50,000 - $100,000</Option>
                  <Option value="$100,000 - $250,000">$100,000 - $250,000</Option>
                  <Option value="$150,000 - $300,000">$150,000 - $300,000</Option>
                  <Option value="$200,000 - $500,000">$200,000 - $500,000</Option>
                  <Option value="$300,000 - $600,000">$300,000 - $600,000</Option>
                  <Option value="$500,000+">$500,000+</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="时间周期" name={['projectPreferences', 'timeline']}>
                <Select placeholder="选择时间周期或自定义输入" mode="tags" allowClear>
                  <Option value="1-2 months">1-2 months</Option>
                  <Option value="2-3 months">2-3 months</Option>
                  <Option value="2-4 months">2-4 months</Option>
                  <Option value="3-6 months">3-6 months</Option>
                  <Option value="4-8 months">4-8 months</Option>
                  <Option value="6-12 months">6-12 months</Option>
                  <Option value="12+ months">12+ months</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="沟通方式" name={['projectPreferences', 'communication']}>
            <Select placeholder="选择沟通方式或自定义输入" mode="tags" allowClear>
              <Option value="Email + Phone">Email + Phone</Option>
              <Option value="Email + Video Call">Email + Video Call</Option>
              <Option value="Phone + Email">Phone + Email</Option>
              <Option value="Video Call + Email">Video Call + Email</Option>
              <Option value="WeChat + Email">WeChat + Email</Option>
              <Option value="WhatsApp + Email">WhatsApp + Email</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">财务信息设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="付款条款" name={['paymentInfo', 'terms']}>
                <Select placeholder="选择付款条款">
                  <Option value="Net 15">Net 15 (15天内付款)</Option>
                  <Option value="Net 30">Net 30 (30天内付款)</Option>
                  <Option value="Net 45">Net 45 (45天内付款)</Option>
                  <Option value="Net 60">Net 60 (60天内付款)</Option>
                  <Option value="Net 90">Net 90 (90天内付款)</Option>
                  <Option value="COD">COD (货到付款)</Option>
                  <Option value="Prepaid">Prepaid (预付款)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="付款方式" name={['paymentInfo', 'method']}>
                <Select placeholder="选择付款方式">
                  <Option value="Wire Transfer">Wire Transfer 电汇</Option>
                  <Option value="Bank Transfer">Bank Transfer 银行转账</Option>
                  <Option value="Credit Card">Credit Card 信用卡</Option>
                  <Option value="ACH Transfer">ACH Transfer ACH转账</Option>
                  <Option value="PayPal">PayPal</Option>
                  <Option value="Check">Check 支票</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="币种" name={['paymentInfo', 'currency']}>
                <Select placeholder="选择币种">
                  <Option value="USD">USD 美元</Option>
                  <Option value="AUD">AUD 澳元</Option>
                  <Option value="CNY">CNY 人民币</Option>
                  <Option value="EUR">EUR 欧元</Option>
                  <Option value="GBP">GBP 英镑</Option>
                  <Option value="HKD">HKD 港币</Option>
                  <Option value="SGD">SGD 新加坡元</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="信用评级" name={['paymentInfo', 'creditRating']}>
                <Select placeholder="选择信用评级">
                  <Option value="A">A - 优秀 (按时付款，信用极佳)</Option>
                  <Option value="B">B - 良好 (付款及时，信用良好)</Option>
                  <Option value="C">C - 一般 (偶有延迟，需要关注)</Option>
                  <Option value="D">D - 较差 (经常延迟，需要预付)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">其他设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="语言偏好" name={['language']}>
                <Select mode="multiple" placeholder="选择语言">
                  <Option value="English">English 英语</Option>
                  <Option value="Mandarin">Mandarin 中文</Option>
                  <Option value="Cantonese">Cantonese 粤语</Option>
                  <Option value="Japanese">Japanese 日语</Option>
                  <Option value="Korean">Korean 韩语</Option>
                  <Option value="French">French 法语</Option>
                  <Option value="German">German 德语</Option>
                  <Option value="Spanish">Spanish 西班牙语</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="业务类型" name={['businessType']}>
                <Select mode="multiple" placeholder="选择业务类型">
                  <Option value="Urban Planning">Urban Planning 城市规划</Option>
                  <Option value="Property Development">Property Development 房地产开发</Option>
                  <Option value="Architecture">Architecture 建筑设计</Option>
                  <Option value="Real Estate">Real Estate 房地产</Option>
                  <Option value="Commercial Development">Commercial Development 商业开发</Option>
                  <Option value="Exhibition Center">Exhibition Center 展览中心</Option>
                  <Option value="Cultural Buildings">Cultural Buildings 文化建筑</Option>
                  <Option value="Public Architecture">Public Architecture 公共建筑</Option>
                  <Option value="Residential">Residential 住宅</Option>
                  <Option value="Tourism">Tourism 旅游</Option>
                  <Option value="Hospitality">Hospitality 酒店业</Option>
                  <Option value="Sports Facilities">Sports Facilities 体育设施</Option>
                  <Option value="Recreation">Recreation 娱乐</Option>
                  <Option value="Entertainment">Entertainment 娱乐业</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">项目历史数据</Divider>

          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>项目历史统计</span>
              <Button 
                type="primary" 
                size="small" 
                icon={<ProjectOutlined />}
                onClick={() => {
                  const companyName = form.getFieldValue('companyName')
                  if (companyName) {
                    updateClientProjectHistory(companyName)
                  } else {
                    message.warning('请先填写公司名称')
                  }
                }}
              >
                从项目管理获取数据
              </Button>
            </div>
            
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="总项目数" name={['projectHistory', 'total']}>
                  <Input type="number" placeholder="0" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="完成项目" name={['projectHistory', 'completed']}>
                  <Input type="number" placeholder="0" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="进行中" name={['projectHistory', 'ongoing']}>
                  <Input type="number" placeholder="0" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="项目总价值" name={['projectHistory', 'value']}>
                  <Input type="number" placeholder="0" disabled addonBefore="$" />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              💡 项目历史数据将从项目管理模块自动获取，确保数据准确性和实时性。
            </div>
          </div>

          <Form.Item label="客户标签" name={['tags']}>
            <Select mode="tags" placeholder="添加客户标签">
              <Option value="VIP客户">VIP客户</Option>
              <Option value="长期合作">长期合作</Option>
              <Option value="大型项目">大型项目</Option>
              <Option value="中型项目">中型项目</Option>
              <Option value="稳定客户">稳定客户</Option>
              <Option value="国际客户">国际客户</Option>
              <Option value="度假项目">度假项目</Option>
              <Option value="豪华住宅">豪华住宅</Option>
              <Option value="体育设施">体育设施</Option>
              <Option value="美国客户">美国客户</Option>
              <Option value="文化建筑">文化建筑</Option>
            </Select>
          </Form.Item>

          <Form.Item label="客户状态" name={['status']}>
            <Select placeholder="选择客户状态">
              <Option value="active">Active 活跃客户</Option>
              <Option value="inactive">Inactive 非活跃</Option>
              <Option value="potential">Potential 潜在客户</Option>
              <Option value="blacklist">Blacklist 黑名单</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">银行信息 *</Divider>

          <Form.Item label="受益人银行名称 *" name={['bankInfo', 'beneficiaryBankName']} rules={[{ required: true, message: '请输入受益人银行名称' }]}>
            <Input placeholder="Commonwealth Bank of Australia" />
          </Form.Item>

          <Form.Item label="受益人银行地址 *" name={['bankInfo', 'beneficiaryBankAddress']} rules={[{ required: true, message: '请输入受益人银行地址' }]}>
            <Input placeholder="240 Queen Street, Brisbane QLD 4000" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="受益人银行代码 *" name={['bankInfo', 'beneficiaryBankCode']} rules={[{ required: true, message: '请输入受益人银行代码' }]}>
                <Input placeholder="062" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="SWIFT代码 *" name={['bankInfo', 'swiftCode']} rules={[{ required: true, message: '请输入SWIFT代码' }]}>
                <Input placeholder="CTBAAU2S" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="受益人账户名称 *" name={['bankInfo', 'beneficiaryAccountName']} rules={[{ required: true, message: '请输入受益人账户名称' }]}>
            <Input placeholder="Company Name Pty Ltd" />
          </Form.Item>

          <Form.Item label="受益人账户号码 *" name={['bankInfo', 'beneficiaryAccountNumber']} rules={[{ required: true, message: '请输入受益人账户号码' }]}>
            <Input placeholder="062-001-12345678" />
          </Form.Item>

          <Form.Item label="备注" name={['notes']}>
            <TextArea rows={3} placeholder="客户备注信息..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        title="批量导入客户信息"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            取消
          </Button>,
          <Button key="template" icon={<FileExcelOutlined />} onClick={downloadTemplate}>
            下载模板
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Upload
            accept=".xlsx,.xls"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} size="large" type="dashed" style={{ height: 80, width: 200 }}>
              <div style={{ marginTop: 8 }}>
                <div>点击上传Excel文件</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  支持 .xlsx, .xls 格式
                </div>
              </div>
            </Button>
          </Upload>
          
          <Divider />
          
          <div style={{ textAlign: 'left' }}>
            <h4>📋 导入说明：</h4>
            <ul style={{ color: '#666', lineHeight: 1.8 }}>
              <li>请先下载Excel模板，按照模板格式填写客户信息</li>
              <li>必填字段标有 * 号，请确保填写完整</li>
              <li>地区字段请使用：Asia-Pacific、North-America、Europe、Middle-East、Other</li>
              <li>状态字段请使用：active、inactive、potential、blacklist</li>
              <li>信用评级请使用：A、B、C、D</li>
              <li>多个标签或类型请用英文逗号分隔</li>
              <li><strong>项目偏好字段：</strong></li>
              <ul style={{ marginLeft: 20, marginTop: 8 }}>
                <li>风格偏好：Modern、Commercial、Residential High-rise、Contemporary、Mixed-use、Grand、Cultural、Exhibition、Resort、Luxury Residential、Sports、Functional</li>
                <li>预算范围：$50,000 - $100,000、$100,000 - $250,000、$150,000 - $300,000、$200,000 - $500,000、$300,000 - $600,000、$500,000+</li>
                <li>时间周期：1-2 months、2-3 months、2-4 months、3-6 months、4-8 months、6-12 months、12+ months</li>
                <li>沟通方式：Email + Phone、Email + Video Call、Phone + Email、Video Call + Email、WeChat + Email、WhatsApp + Email</li>
              </ul>
              <li><strong>财务信息字段：</strong></li>
              <ul style={{ marginLeft: 20, marginTop: 8 }}>
                <li>付款条款：Net 15、Net 30、Net 45、Net 60、Net 90、COD、Prepaid</li>
                <li>付款方式：Wire Transfer、Bank Transfer、Credit Card、ACH Transfer、PayPal、Check</li>
                <li>币种：USD、AUD、CNY、EUR、GBP、HKD、SGD</li>
              </ul>
              <li><strong>项目历史数据：</strong>导入后可点击"从项目管理获取数据"按钮自动同步最新数据</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ClientManagement 
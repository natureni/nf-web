import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Progress,
  Modal,
  message,
  Tooltip,
  Card,
  Row,
  Col,
  Divider,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'

const { Option } = Select

interface Project {
  id: string
  name: string
  protocolNumber: string
  client: string
  status: 'reporting' | 'modeling' | 'rendering' | 'delivering'
  deadline: string
  budget: number
  currency: string // 项目原始币种
  exchangeRate: number // 当时的汇率
  budgetCNY: number // 人民币预算
  paymentStatus: 'unpaid' | 'partial' | 'completed' | 'overdue'
  progress: number
  type: string
}

// 合同服务项目接口
interface ContractService {
  camera: string
  qty: number
  unitPrice: number
  price: number
}

// 合同信息接口
interface ContractInfo {
  project: Project
  services: ContractService[]
  discount: number
  total: number
  invoiceNumber: string
}

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [searchText, setSearchText] = useState('')
  const [contractModalVisible, setContractModalVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  // 获取默认示例项目数据
  const getDefaultProjects = (): Project[] => {
    return [
      {
        id: 'NF2501',
        name: 'Sydney CBD Tower',
        protocolNumber: 'NF2501',
        client: 'Bathurst开发公司',
        status: 'reporting',
        deadline: '2025-03-15',
        budget: 45000, // 澳元预算
        currency: 'AUD',
        exchangeRate: 4.78,
        budgetCNY: 215100, // 转换为人民币
        paymentStatus: 'unpaid',
        progress: 8,
        type: '商业综合体',
      },
      {
        id: 'NF2502',
        name: 'Manhattan Office Complex',
        protocolNumber: 'NF2502',
        client: 'NCCEC集团',
        status: 'modeling',
        deadline: '2025-04-20',
        budget: 68000, // 美元预算
        currency: 'USD',
        exchangeRate: 7.24,
        budgetCNY: 492320, // 转换为人民币
        paymentStatus: 'partial',
        progress: 35,
        type: '办公建筑',
      },
      {
        id: 'NF2503',
        name: 'Berlin Innovation Center',
        protocolNumber: 'NF2503',
        client: 'Olympic Club International',
        status: 'rendering',
        deadline: '2025-02-28',
        budget: 52000, // 欧元预算
        currency: 'EUR',
        exchangeRate: 7.85,
        budgetCNY: 408200, // 转换为人民币
        paymentStatus: 'partial',
        progress: 72,
        type: '创新中心',
      },
      {
        id: 'NF2504',
        name: '上海国际金融中心',
        protocolNumber: 'NF2504',
        client: 'Norwell置业',
        status: 'delivering',
        deadline: '2025-02-15',
        budget: 278740, // 人民币预算
        currency: 'CNY',
        exchangeRate: 1.00,
        budgetCNY: 278740, // 转换为人民币
        paymentStatus: 'completed',
        progress: 95,
        type: '金融中心',
      },
      {
        id: 'NF2505',
        name: 'Dubai Marina Towers',
        protocolNumber: 'NF2505',
        client: '科技创新园',
        status: 'modeling',
        deadline: '2025-05-10',
        budget: 275000, // 迪拉姆预算
        currency: 'AED',
        exchangeRate: 1.97,
        budgetCNY: 541750, // 转换为人民币
        paymentStatus: 'partial',
        progress: 28,
        type: '海滨大厦',
      },
      {
        id: 'NF2506',
        name: 'Toronto Skyline Plaza',
        protocolNumber: 'NF2506',
        client: '文化艺术区管委会',
        status: 'rendering',
        deadline: '2025-03-25',
        budget: 58000, // 加元预算
        currency: 'CAD',
        exchangeRate: 5.32,
        budgetCNY: 308560, // 转换为人民币
        paymentStatus: 'completed',
        progress: 88,
        type: '城市广场',
      },
      {
        id: 'NF2507',
        name: 'London Bridge District',
        protocolNumber: 'NF2507',
        client: '海滨度假村集团',
        status: 'delivering',
        deadline: '2025-02-20',
        budget: 48000, // 英镑预算
        currency: 'GBP',
        exchangeRate: 9.12,
        budgetCNY: 437760, // 转换为人民币
        paymentStatus: 'completed',
        progress: 100,
        type: '商业区',
      },
      {
        id: 'NF2508',
        name: 'Singapore Bay Gardens',
        protocolNumber: 'NF2508',
        client: '智慧城市开发商',
        status: 'reporting',
        deadline: '2025-06-15',
        budget: 110000, // 新加坡元预算
        currency: 'SGD',
        exchangeRate: 5.36,
        budgetCNY: 589600, // 转换为人民币
        paymentStatus: 'unpaid',
        progress: 12,
        type: '海湾花园',
      },
    ]
  }

  // 加载项目数据
  const loadProjects = () => {
    try {
      const storedProjectsJson = localStorage.getItem('nflab_projects')
      if (storedProjectsJson) {
        const storedProjects = JSON.parse(storedProjectsJson)
        setProjects(storedProjects)
        console.log('从localStorage加载项目数据:', storedProjects)
      } else {
        // 如果没有存储的数据，使用默认示例数据并保存到localStorage
        const defaultProjects = getDefaultProjects()
        setProjects(defaultProjects)
        localStorage.setItem('nflab_projects', JSON.stringify(defaultProjects))
        console.log('初始化默认项目数据:', defaultProjects)
      }
    } catch (error) {
      console.error('加载项目数据失败:', error)
      // 出错时使用默认数据
      const defaultProjects = getDefaultProjects()
      setProjects(defaultProjects)
      message.error('加载项目数据失败，显示默认数据')
    }
  }

  // 组件挂载时加载数据
  React.useEffect(() => {
    loadProjects()
  }, [])

  // 页面获得焦点时重新加载数据（从其他页面返回时）
  React.useEffect(() => {
    const handleFocus = () => {
      loadProjects()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // 删除项目
  const handleDeleteProject = (project: Project) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${project.name}"吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        try {
          // 从当前项目列表中移除
          const updatedProjects = projects.filter(p => p.id !== project.id)
          
          // 更新状态
          setProjects(updatedProjects)
          
          // 更新localStorage
          localStorage.setItem('nflab_projects', JSON.stringify(updatedProjects))
          
          message.success(`项目"${project.name}"删除成功`)
          console.log('项目删除成功:', project.name)
        } catch (error) {
          console.error('删除项目失败:', error)
          message.error('删除项目失败，请重试')
        }
      },
    })
  }

  // 状态配置 - 按要求修改为4个状态
  const getStatusConfig = (status: string) => {
    const configs = {
      reporting: { color: '#d9d9d9', text: '报备中' },
      modeling: { color: '#fa8c16', text: '建模' },
      rendering: { color: '#52c41a', text: '渲染' },
      delivering: { color: '#ff4d4f', text: '出图' },
    }
    return configs[status as keyof typeof configs] || { color: '#d9d9d9', text: '未知' }
  }

  // 付款状态配置
  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      unpaid: { color: '#ff4d4f', text: '未付款' },
      partial: { color: '#fa8c16', text: '部分付款' },
      completed: { color: '#52c41a', text: '已付款' },
      overdue: { color: '#a8071a', text: '逾期' },
    }
    return configs[status as keyof typeof configs] || { color: '#d9d9d9', text: '未知' }
  }

  // 获取进度条颜色
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a'
    if (progress >= 50) return '#1890ff'
    if (progress >= 20) return '#fa8c16'
    return '#ff4d4f'
  }

  // 获取唯一客户列表
  const uniqueClients = Array.from(new Set(projects.map(p => p.client))).sort()

  // 根据项目预算智能生成服务项目
  const generateContractServices = (project: Project): ContractService[] => {
    const services: ContractService[] = []
    
    // 根据原币种预算计算服务项目
    const originalBudget = project.budget
    const currency = project.currency
    
    // 基础服务项目，根据预算动态调整
    if (originalBudget >= 15000) { // 适中预算项目
      services.push({
        camera: 'C01 - Bird View Rendering',
        qty: Math.ceil(originalBudget / 12000),
        unitPrice: currency === 'EUR' ? 1500 : currency === 'AUD' ? 2400 : 1600,
        price: currency === 'EUR' ? 1500 : currency === 'AUD' ? 2400 : 1600
      })
    }
    
    if (originalBudget >= 20000) { // 中等预算项目
      services.push({
        camera: 'C02 - Human View Rendering',
        qty: Math.ceil(originalBudget / 15000),
        unitPrice: currency === 'EUR' ? 750 : currency === 'AUD' ? 1200 : 800,
        price: currency === 'EUR' ? 750 : currency === 'AUD' ? 1200 : 800
      })
    }
    
    if (originalBudget >= 30000) { // 高预算项目
      services.push({
        camera: 'C03 - Animation Rendering',
        qty: Math.ceil(originalBudget / 25000),
        unitPrice: currency === 'EUR' ? 130 : currency === 'AUD' ? 210 : 140,
        price: currency === 'EUR' ? 130 : currency === 'AUD' ? 210 : 140
      })
    }
    
    if (originalBudget >= 50000) { // 超高预算项目
      services.push({
        camera: 'C04 - Premium Package',
        qty: 1,
        unitPrice: currency === 'EUR' ? 1300 : currency === 'AUD' ? 2100 : 1500,
        price: currency === 'EUR' ? 1300 : currency === 'AUD' ? 2100 : 1500
      })
    }
    
    return services
  }

  // 生成合同信息
  const generateContractInfo = (project: Project): ContractInfo => {
    const services = generateContractServices(project)
    const subtotal = services.reduce((sum, service) => sum + service.price, 0)
    const discount = 15 // 15% 折扣
    const total = Math.round(subtotal * (1 - discount / 100))
    
    return {
      project,
      services,
      discount,
      total,
      invoiceNumber: `NF${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    }
  }

  // 生成PDF合同
  const generatePDF = (contractInfo: ContractInfo) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 20
      let currentY = margin

      // 设置字体（使用内置字体以避免中文显示问题）
      pdf.setFont('helvetica', 'normal')

      // 标题区域
      pdf.setFontSize(24)
      pdf.setTextColor(24, 144, 255) // 蓝色
      pdf.text('NFLAB', margin, currentY)
      
      pdf.setFontSize(10)
      pdf.setTextColor(102, 102, 102) // 灰色
      pdf.text('Architectural Illustration Lab', margin, currentY + 6)

      // INVOICE标题
      pdf.setFontSize(28)
      pdf.setTextColor(24, 144, 255)
      pdf.text('INVOICE', pageWidth - margin - 40, currentY, { align: 'right' })

      currentY += 25

      // 分割线
      pdf.setDrawColor(24, 144, 255)
      pdf.setLineWidth(1)
      pdf.line(margin, currentY, pageWidth - margin, currentY)
      currentY += 15

      // 账单信息
      pdf.setFontSize(12)
      pdf.setTextColor(24, 144, 255)
      pdf.text('BILL TO:', margin, currentY)
      pdf.text('PAYABLE TO:', pageWidth / 2 + 10, currentY)

      currentY += 8
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      
      // 左侧账单信息
      pdf.setFont('helvetica', 'bold')
      pdf.text(contractInfo.project.client, margin, currentY)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Level 12, 300 George Street', margin, currentY + 5)
      pdf.text('Brisbane, QLD 4000, Australia', margin, currentY + 10)

      // 右侧收款信息
      pdf.setFont('helvetica', 'bold')
      pdf.text('NFLAB', pageWidth / 2 + 10, currentY)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Universal Building No.1168 Hoyi Rd', pageWidth / 2 + 10, currentY + 5)
      pdf.text('Shanghai, China', pageWidth / 2 + 10, currentY + 10)
      pdf.text('www.nflabtw.com', pageWidth / 2 + 10, currentY + 15)

      currentY += 35

      // 项目信息
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Project Name: ${contractInfo.project.name}`, margin, currentY)
      pdf.text(`Invoice Number: ${contractInfo.invoiceNumber}`, margin, currentY + 6)
      pdf.text(`Services: ${contractInfo.project.type}`, margin, currentY + 12)

      currentY += 25

      // 服务表格
      const tableStartY = currentY
      const tableWidth = pageWidth - 2 * margin
      const colWidths = [40, 30, 40, 40] // 列宽度
      const colPositions = [margin]
      for (let i = 1; i < colWidths.length; i++) {
        colPositions.push(colPositions[i-1] + colWidths[i-1])
      }

      // 表格头部
      pdf.setFillColor(24, 144, 255)
      pdf.rect(margin, currentY, tableWidth, 8, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Camera', colPositions[0] + 2, currentY + 5)
      pdf.text('QTY', colPositions[1] + 2, currentY + 5)
      pdf.text('Unit Price', colPositions[2] + 2, currentY + 5)
      pdf.text('Price', colPositions[3] + 2, currentY + 5)

      currentY += 8

      // 表格数据
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      
      contractInfo.services.forEach((service, index) => {
        const rowY = currentY + (index * 6)
        
        // 交替行背景
        if (index % 2 === 0) {
          pdf.setFillColor(249, 249, 249)
          pdf.rect(margin, rowY, tableWidth, 6, 'F')
        }

        pdf.text(service.camera, colPositions[0] + 2, rowY + 4)
        pdf.text(service.qty.toString(), colPositions[1] + 2, rowY + 4)
        pdf.text(`$${service.unitPrice}`, colPositions[2] + 2, rowY + 4)
        pdf.text(`$${service.price}`, colPositions[3] + 2, rowY + 4)
      })

      currentY += contractInfo.services.length * 6

      // 折扣行
      pdf.setFillColor(51, 51, 51)
      pdf.rect(margin, currentY, tableWidth, 6, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Discount', colPositions[0] + 2, currentY + 4)
      pdf.text(`${contractInfo.discount}%`, colPositions[3] + 2, currentY + 4)

      currentY += 6

      // 总计行
      pdf.setFillColor(0, 0, 0)
      pdf.rect(margin, currentY, tableWidth, 6, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.text('Total', colPositions[0] + 2, currentY + 4)
      pdf.text(`$${contractInfo.total.toLocaleString()}`, colPositions[3] + 2, currentY + 4)

      currentY += 15

      // 银行信息
      pdf.setTextColor(24, 144, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Wire Transfer Information', margin, currentY)

      currentY += 8
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)

      const bankInfo = [
        'Beneficiary Bank Name: The Hongkong and Shanghai Banking Corporation Limited',
        'Beneficiary Bank Address: 1 Queen\'s Road Central Hong Kong',
        'Beneficiary Bank Code: 004',
        'SWIFT Code: HSBCHKHHHKH',
        'Beneficiary Account Name: NFlab Information Technology Co., Limited',
        'Beneficiary Account Number: 149 - 291346 - 838',
        'Business Payment Address: Room 11168 Universal Building No.1168 Hoyi Rd, Shanghai, China'
      ]

      bankInfo.forEach((info, index) => {
        pdf.text(info, margin, currentY + (index * 4))
      })

      // 生成文件名
      const fileName = `NFLAB_Contract_${contractInfo.invoiceNumber}_${contractInfo.project.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      
      // 下载PDF
      pdf.save(fileName)
      
      message.success(`合同PDF已生成并下载：${fileName}`)
    } catch (error) {
      console.error('PDF生成错误:', error)
      message.error('PDF生成失败，请重试')
    }
  }

  // 打印合同
  const printContract = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && selectedProject) {
      const contractInfo = generateContractInfo(selectedProject)
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>项目合同 - ${contractInfo.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { border-bottom: 3px solid #1890ff; padding-bottom: 10px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; color: #1890ff; }
            .company-subtitle { font-size: 12px; color: #666; margin-top: 5px; }
            .invoice-title { font-size: 28px; color: #1890ff; text-align: right; margin-top: -40px; }
            .billing-info { display: flex; gap: 40px; margin: 20px 0; }
            .bill-to, .payable-to { flex: 1; background: #f5f5f5; padding: 15px; }
            .bill-to h3, .payable-to h3 { margin: 0 0 10px 0; color: #1890ff; font-size: 14px; }
            .project-info { margin: 20px 0; }
            .project-info div { margin: 5px 0; }
            .services-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .services-table th { background: #1890ff; color: white; padding: 12px; text-align: center; }
            .services-table td { padding: 10px; text-align: center; border: 1px solid #ddd; }
            .services-table tr:nth-child(even) { background: #f9f9f9; }
            .discount-row { background: #333 !important; color: white; }
            .total-row { background: #000 !important; color: white; font-weight: bold; }
            .bank-info { margin-top: 30px; background: #f5f5f5; padding: 15px; }
            .bank-info h3 { color: #1890ff; margin-bottom: 10px; }
            .bank-info div { margin: 3px 0; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">NFLAB</div>
            <div class="company-subtitle">Architectural Illustration Lab</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="billing-info">
            <div class="bill-to">
              <h3>BILL TO:</h3>
              <div><strong>${contractInfo.project.client}</strong></div>
              <div>Level 12, 300 George Street</div>
              <div>Brisbane, QLD 4000, Australia</div>
            </div>
            <div class="payable-to">
              <h3>PAYABLE TO:</h3>
              <div><strong>NFLAB</strong></div>
              <div>Universal Building No.1168 Hoyi Rd, Shanghai, China</div>
              <div>www.nflabtw.com</div>
            </div>
          </div>
          
          <div class="project-info">
            <div><strong>Project Name:</strong> ${contractInfo.project.name}</div>
            <div><strong>Invoice Number:</strong> ${contractInfo.invoiceNumber}</div>
            <div><strong>Services:</strong> ${contractInfo.project.type}</div>
          </div>
          
          <table class="services-table">
            <thead>
              <tr>
                <th>Camera</th>
                <th>QTY</th>
                <th>Unit Price</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${contractInfo.services.map(service => `
                <tr>
                  <td>${service.camera}</td>
                  <td>${service.qty}</td>
                  <td>$${service.unitPrice}</td>
                  <td>$${service.price}</td>
                </tr>
              `).join('')}
              <tr class="discount-row">
                <td colspan="3">Discount</td>
                <td>${contractInfo.discount}%</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td>$${contractInfo.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="bank-info">
            <h3>Wire Transfer Information</h3>
            <div><strong>Beneficiary Bank Name:</strong> The Hongkong and Shanghai Banking Corporation Limited</div>
            <div><strong>Beneficiary Bank Address:</strong> 1 Queen's Road Central Hong Kong</div>
            <div><strong>Beneficiary Bank Code:</strong> 004</div>
            <div><strong>SWIFT Code:</strong> HSBCHKHHHKH</div>
            <div><strong>Beneficiary Account Name:</strong> NFlab Information Technology Co., Limited</div>
            <div><strong>Beneficiary Account Number:</strong> 149 - 291346 - 838</div>
            <div><strong>Business Payment Address:</strong> Room 11168 Universal Building No.1168 Hoyi Rd, Shanghai, China</div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // 渲染合同预览
  const renderContractPreview = () => {
    if (!selectedProject) return null
    
    const contractInfo = generateContractInfo(selectedProject)
    
    return (
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* 合同头部 */}
        <div style={{ borderBottom: '3px solid #1890ff', paddingBottom: 16, marginBottom: 24 }}>
          <Row>
            <Col span={12}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>NFLAB</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Architectural Illustration Lab</div>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, color: '#1890ff', fontWeight: 'bold' }}>INVOICE</div>
            </Col>
          </Row>
        </div>

        {/* 账单信息 */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card size="small" title="BILL TO:" headStyle={{ background: '#f0f0f0', color: '#1890ff' }}>
              <div style={{ fontWeight: 'bold' }}>{contractInfo.project.client}</div>
              <div>Level 12, 300 George Street</div>
              <div>Brisbane, QLD 4000, Australia</div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="PAYABLE TO:" headStyle={{ background: '#f0f0f0', color: '#1890ff' }}>
              <div style={{ fontWeight: 'bold' }}>NFLAB</div>
              <div>Universal Building No.1168 Hoyi Rd, Shanghai, China</div>
              <div>www.nflabtw.com</div>
            </Card>
          </Col>
        </Row>

        {/* 项目信息 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8 }}><strong>Project Name:</strong> {contractInfo.project.name}</div>
          <div style={{ marginBottom: 8 }}><strong>Invoice Number:</strong> {contractInfo.invoiceNumber}</div>
          <div style={{ marginBottom: 8 }}><strong>Services:</strong> {contractInfo.project.type}</div>
        </div>

        {/* 服务表格 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#1890ff', color: 'white' }}>
              <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Camera</th>
              <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>QTY</th>
              <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Unit Price</th>
              <th style={{ padding: 12, textAlign: 'center', border: '1px solid #ddd' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {contractInfo.services.map((service, index) => (
              <tr key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>{service.camera}</td>
                <td style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>{service.qty}</td>
                <td style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>${service.unitPrice}</td>
                <td style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>${service.price}</td>
              </tr>
            ))}
            <tr style={{ background: '#333', color: 'white' }}>
              <td colSpan={3} style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>Discount</td>
              <td style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>{contractInfo.discount}%</td>
            </tr>
            <tr style={{ background: '#000', color: 'white', fontWeight: 'bold' }}>
              <td colSpan={3} style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>Total</td>
              <td style={{ padding: 8, textAlign: 'center', border: '1px solid #ddd' }}>${contractInfo.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* 银行信息 */}
        <Card title="Wire Transfer Information" size="small" style={{ background: '#f5f5f5' }}>
          <Row gutter={[16, 8]}>
            <Col span={24}><strong>Beneficiary Bank Name:</strong> The Hongkong and Shanghai Banking Corporation Limited</Col>
            <Col span={24}><strong>Beneficiary Bank Address:</strong> 1 Queen's Road Central Hong Kong</Col>
            <Col span={12}><strong>Beneficiary Bank Code:</strong> 004</Col>
            <Col span={12}><strong>SWIFT Code:</strong> HSBCHKHHHKH</Col>
            <Col span={24}><strong>Beneficiary Account Name:</strong> NFlab Information Technology Co., Limited</Col>
            <Col span={24}><strong>Beneficiary Account Number:</strong> 149 - 291346 - 838</Col>
            <Col span={24}><strong>Business Payment Address:</strong> Room 11168 Universal Building No.1168 Hoyi Rd, Shanghai, China</Col>
          </Row>
        </Card>
      </div>
    )
  }

  const columns: ColumnsType<Project> = [
    {
      title: '协议号',
      dataIndex: 'protocolNumber',
      width: 140,
      render: (protocolNumber) => (
        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 500 }}>
          {protocolNumber}
        </span>
      ),
    },
    {
      title: '项目名称',
      key: 'projectName',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4, color: '#262626' }}>
            {record.name}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.id}
          </div>
        </div>
      ),
    },
    {
      title: '客户',
      dataIndex: 'client',
      width: 150,
      filters: uniqueClients.map(client => ({ text: client, value: client })),
      onFilter: (value, record) => record.client === value,
      render: (client) => (
        <span style={{ fontWeight: 500 }}>{client}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      filters: [
        { text: '报备中', value: 'reporting' },
        { text: '建模', value: 'modeling' },
        { text: '渲染', value: 'rendering' },
        { text: '出图', value: 'delivering' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const config = getStatusConfig(status)
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      width: 120,
      sorter: (a, b) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix(),
      render: (deadline) => {
        const isOverdue = dayjs(deadline).isBefore(dayjs(), 'day')
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : '#262626' }}>
            📅 {dayjs(deadline).format('YYYY-MM-DD')}
          </span>
        )
      },
    },
    {
      title: '预算',
      key: 'budget',
      width: 200,
      sorter: (a, b) => a.budgetCNY - b.budgetCNY,
      render: (_, record) => {
        // 获取币种符号
        const getCurrencySymbol = (currency: string) => {
          const symbols: { [key: string]: string } = {
            'USD': '$',
            'AUD': 'A$',
            'EUR': '€',
            'CNY': '¥',
            'GBP': '£',
            'CAD': 'C$'
          }
          return symbols[currency] || currency
        }

        return (
          <div>
            <div style={{ fontWeight: 500, color: '#1890ff', fontSize: '14px' }}>
              ¥{record.budgetCNY.toLocaleString()}
            </div>
            {record.currency !== 'CNY' && (
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>
                {getCurrencySymbol(record.currency)}{record.budget.toLocaleString()} 
                <span style={{ marginLeft: 4 }}>({record.currency})</span>
              </div>
            )}
            {record.currency !== 'CNY' && (
              <div style={{ fontSize: '11px', color: '#bfbfbf', marginTop: 1 }}>
                汇率: {record.exchangeRate}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: '付款状态',
      dataIndex: 'paymentStatus',
      width: 110,
      filters: [
        { text: '未付款', value: 'unpaid' },
        { text: '部分付款', value: 'partial' },
        { text: '已付款', value: 'completed' },
        { text: '逾期', value: 'overdue' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
      render: (paymentStatus) => {
        const config = getPaymentStatusConfig(paymentStatus)
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={getProgressColor(progress)}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="生成合同">
            <Button 
              type="text" 
              size="small" 
              icon={<FileTextOutlined style={{ color: '#52c41a' }} />}
              onClick={() => {
                setSelectedProject(record)
                setContractModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="编辑项目">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />}
              onClick={() => navigate(`/projects/create/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="删除项目">
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => handleDeleteProject(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // 过滤数据
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchText.toLowerCase()) ||
                         project.protocolNumber.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = !statusFilter || project.status === statusFilter
    const matchesClient = !clientFilter || project.client === clientFilter
    return matchesSearch && matchesStatus && matchesClient
  })

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>项目管理</h1>
            <p style={{ color: '#8c8c8c', marginTop: 8 }}>
              管理和跟踪所有项目的状态和进度
            </p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => navigate('/projects/create')}
          >
            新建项目
          </Button>
        </div>
      </div>

      <div className="content-wrapper">
        {/* 搜索和筛选区域 */}
        <div style={{ 
          marginBottom: 24, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 16 
        }}>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <Input
              placeholder="搜索项目名称、合同号或客户..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </div>
          
          <Space size={12}>
            <Select
              placeholder="全部状态"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              size="large"
            >
              <Option value="">全部状态</Option>
              <Option value="reporting">报备中</Option>
              <Option value="modeling">建模</Option>
              <Option value="rendering">渲染</Option>
              <Option value="delivering">出图</Option>
            </Select>

            <Select
              placeholder="全部客户"
              allowClear
              value={clientFilter}
              onChange={setClientFilter}
              style={{ width: 150 }}
              size="large"
            >
              <Option value="">全部客户</Option>
              {uniqueClients.map(client => (
                <Option key={client} value={client}>{client}</Option>
              ))}
            </Select>
            
            <Button 
              icon={<FilterOutlined />} 
              size="large"
              onClick={() => message.info('更多筛选功能开发中')}
            >
              更多筛选
            </Button>
            
            <Button 
              icon={<SortAscendingOutlined />} 
              size="large"
              onClick={() => message.info('排序功能开发中')}
            >
              排序
            </Button>
          </Space>
        </div>

        {/* 项目统计卡片 */}
        <div style={{ 
          marginBottom: 24, 
          display: 'flex', 
          gap: 16,
          padding: '16px 0'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredProjects.length}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>总项目数</div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {filteredProjects.filter(p => p.status === 'modeling').length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>建模中</div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {filteredProjects.filter(p => p.status === 'rendering').length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>渲染中</div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#262626',
            padding: '12px 20px',
            borderRadius: '8px',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {filteredProjects.filter(p => p.status === 'delivering').length}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>出图中</div>
          </div>
        </div>

        {/* 项目表格 */}
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          pagination={{
            total: filteredProjects.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `显示 ${range[0]}-${range[1]} 条记录，共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1400 }}
          size="middle"
          style={{
            background: '#fff',
            borderRadius: '8px',
          }}
          rowClassName={(_, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </div>

      {/* 合同生成模态框 */}
      <Modal
        title={selectedProject ? `生成项目合同 - ${selectedProject.name}` : '生成项目合同'}
        open={contractModalVisible}
        onCancel={() => setContractModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setContractModalVisible(false)}>
            取消
          </Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={printContract}>
            打印合同
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={() => selectedProject && generatePDF(generateContractInfo(selectedProject))}
          >
            下载PDF
          </Button>,
        ]}
      >
        {renderContractPreview()}
      </Modal>
    </div>
  )
}

export default ProjectList 
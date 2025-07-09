import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'

// 导入类型定义
import { Project, ContractService, ContractInfo, ProjectFilters } from '../types/project'

// 导入组件
import ProjectStats from '../components/project/ProjectStats'
import ProjectSearchFilters from '../components/project/ProjectSearchFilters'
import ProjectTable from '../components/project/ProjectTable'

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ProjectFilters>({
    searchText: '',
    statusFilter: '',
    clientFilter: ''
  })
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
        budget: 45000,
        currency: 'AUD',
        exchangeRate: 4.78,
        budgetCNY: 215100,
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
        budget: 68000,
        currency: 'USD',
        exchangeRate: 7.24,
        budgetCNY: 492320,
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
        budget: 52000,
        currency: 'EUR',
        exchangeRate: 7.85,
        budgetCNY: 408200,
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
        budget: 278740,
        currency: 'CNY',
        exchangeRate: 1.00,
        budgetCNY: 278740,
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
        budget: 275000,
        currency: 'AED',
        exchangeRate: 1.97,
        budgetCNY: 541750,
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
        budget: 58000,
        currency: 'CAD',
        exchangeRate: 5.32,
        budgetCNY: 308560,
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
        budget: 48000,
        currency: 'GBP',
        exchangeRate: 9.12,
        budgetCNY: 437760,
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
        budget: 110000,
        currency: 'SGD',
        exchangeRate: 5.36,
        budgetCNY: 589600,
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
        const defaultProjects = getDefaultProjects()
        setProjects(defaultProjects)
        localStorage.setItem('nflab_projects', JSON.stringify(defaultProjects))
        console.log('初始化默认项目数据:', defaultProjects)
      }
    } catch (error) {
      console.error('加载项目数据失败:', error)
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
          const updatedProjects = projects.filter(p => p.id !== project.id)
          setProjects(updatedProjects)
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

  // 编辑项目
  const handleEditProject = (project: Project) => {
    navigate(`/projects/edit/${project.id}`)
  }

  // 生成合同
  const handleGenerateContract = (project: Project) => {
    setSelectedProject(project)
    setContractModalVisible(true)
  }

  // 获取唯一客户列表
  const uniqueClients = Array.from(new Set(projects.map(p => p.client))).sort()

  // 过滤数据
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(filters.searchText.toLowerCase()) ||
                         project.client.toLowerCase().includes(filters.searchText.toLowerCase()) ||
                         project.protocolNumber.toLowerCase().includes(filters.searchText.toLowerCase())
    const matchesStatus = !filters.statusFilter || project.status === filters.statusFilter
    const matchesClient = !filters.clientFilter || project.client === filters.clientFilter
    return matchesSearch && matchesStatus && matchesClient
  })

  // 根据项目预算智能生成服务项目
  const generateContractServices = (project: Project): ContractService[] => {
    const services: ContractService[] = []
    const originalBudget = project.budget
    const currency = project.currency
    
    if (originalBudget >= 15000) {
      services.push({
        camera: 'C01 - Bird View Rendering',
        qty: Math.ceil(originalBudget / 12000),
        unitPrice: currency === 'EUR' ? 1500 : currency === 'AUD' ? 2400 : 1600,
        price: currency === 'EUR' ? 1500 : currency === 'AUD' ? 2400 : 1600
      })
    }
    
    if (originalBudget >= 20000) {
      services.push({
        camera: 'C02 - Human View Rendering',
        qty: Math.ceil(originalBudget / 15000),
        unitPrice: currency === 'EUR' ? 750 : currency === 'AUD' ? 1200 : 800,
        price: currency === 'EUR' ? 750 : currency === 'AUD' ? 1200 : 800
      })
    }
    
    if (originalBudget >= 30000) {
      services.push({
        camera: 'C03 - Animation Rendering',
        qty: Math.ceil(originalBudget / 25000),
        unitPrice: currency === 'EUR' ? 130 : currency === 'AUD' ? 210 : 140,
        price: currency === 'EUR' ? 130 : currency === 'AUD' ? 210 : 140
      })
    }
    
    if (originalBudget >= 50000) {
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
    const discount = 15
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

      pdf.setFont('helvetica', 'normal')

      // 标题区域
      pdf.setFontSize(24)
      pdf.setTextColor(24, 144, 255)
      pdf.text('NFLAB', margin, currentY)
      
      pdf.setFontSize(10)
      pdf.setTextColor(102, 102, 102)
      pdf.text('Architectural Illustration Lab', margin, currentY + 6)

      pdf.setFontSize(28)
      pdf.setTextColor(24, 144, 255)
      pdf.text('INVOICE', pageWidth - margin - 40, currentY, { align: 'right' })

      currentY += 25

      // 分割线
      pdf.setDrawColor(24, 144, 255)
      pdf.setLineWidth(1)
      pdf.line(margin, currentY, pageWidth - margin, currentY)
      currentY += 15

      // 客户信息
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Bill To:', margin, currentY)
      pdf.text(`Client: ${contractInfo.project.client}`, margin, currentY + 8)
      pdf.text(`Project: ${contractInfo.project.name}`, margin, currentY + 16)

      // 发票信息
      pdf.text('Invoice Number:', pageWidth - margin - 60, currentY, { align: 'left' })
      pdf.text(contractInfo.invoiceNumber, pageWidth - margin, currentY, { align: 'right' })
      pdf.text('Date:', pageWidth - margin - 60, currentY + 8, { align: 'left' })
      pdf.text(dayjs().format('YYYY-MM-DD'), pageWidth - margin, currentY + 8, { align: 'right' })

      currentY += 35

      // 服务列表表头
      pdf.setFillColor(240, 240, 240)
      pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F')
      
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Service', margin + 5, currentY + 5)
      pdf.text('Qty', margin + 80, currentY + 5)
      pdf.text('Unit Price', margin + 110, currentY + 5)
      pdf.text('Amount', pageWidth - margin - 20, currentY + 5, { align: 'right' })

      currentY += 12

      // 服务列表
      contractInfo.services.forEach((service) => {
        pdf.setFontSize(9)
        pdf.text(service.camera, margin + 5, currentY)
        pdf.text(service.qty.toString(), margin + 80, currentY)
        pdf.text(`$${service.unitPrice}`, margin + 110, currentY)
        pdf.text(`$${service.price}`, pageWidth - margin - 20, currentY, { align: 'right' })
        currentY += 8
      })

      // 总计
      currentY += 10
      const subtotal = contractInfo.services.reduce((sum, s) => sum + s.price, 0)
      
      pdf.text('Subtotal:', pageWidth - margin - 60, currentY, { align: 'left' })
      pdf.text(`$${subtotal}`, pageWidth - margin - 20, currentY, { align: 'right' })
      
      currentY += 8
      pdf.text(`Discount (${contractInfo.discount}%):`, pageWidth - margin - 60, currentY, { align: 'left' })
      pdf.text(`-$${subtotal - contractInfo.total}`, pageWidth - margin - 20, currentY, { align: 'right' })
      
      currentY += 8
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Total:', pageWidth - margin - 60, currentY, { align: 'left' })
      pdf.text(`$${contractInfo.total}`, pageWidth - margin - 20, currentY, { align: 'right' })

      // 保存PDF
      pdf.save(`Contract_${contractInfo.project.protocolNumber}_${dayjs().format('YYYYMMDD')}.pdf`)
      message.success('合同PDF生成成功！')
    } catch (error) {
      console.error('PDF生成失败:', error)
      message.error('PDF生成失败，请重试')
    }
  }

  // 打印合同
  const printContract = () => {
    if (selectedProject) {
      const contractInfo = generateContractInfo(selectedProject)
      generatePDF(contractInfo)
      setContractModalVisible(false)
    }
  }

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
        <ProjectSearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          uniqueClients={uniqueClients}
        />
        
        <ProjectStats projects={filteredProjects} />
        
        <ProjectTable
          projects={filteredProjects}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onGenerateContract={handleGenerateContract}
        />
      </div>

      {/* 合同预览模态框 */}
      <Modal
        title="合同预览"
        open={contractModalVisible}
        onCancel={() => setContractModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setContractModalVisible(false)}>
            取消
          </Button>,
          <Button key="print" type="primary" onClick={printContract}>
            生成PDF
          </Button>,
        ]}
      >
        {selectedProject && (
          <div style={{ padding: '20px' }}>
            <h3>项目: {selectedProject.name}</h3>
            <p>客户: {selectedProject.client}</p>
            <p>预算: ¥{selectedProject.budgetCNY.toLocaleString()}</p>
            <p>合同将包含基于项目预算自动生成的服务项目</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProjectList 
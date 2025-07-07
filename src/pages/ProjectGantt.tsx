import React, { useState } from 'react'
import { Table, Button, DatePicker, Select, Tag, Slider, Modal, Input, InputNumber, message, Checkbox, Popover } from 'antd'
import { FilterOutlined, EyeOutlined, EditOutlined, LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

// 时间范围模式配置
const TIME_RANGE_MODES = [
  { label: '7天', value: 7, days: 7 },
  { label: '30天', value: 30, days: 30 },
  { label: '3个月', value: 90, days: 90 },
  { label: '6个月', value: 180, days: 180 },
  { label: '12个月', value: 365, days: 365 },
]

interface TaskCell {
  type: 'M' | 'R' | 'F' | 'P' | 'notice' | 'empty'  // M=模型, R=渲染, F=出图, P=暂停
  count?: number
  note?: string
}

interface Project {
  id: string
  name: string
  client: string
  status: 'reporting' | 'modeling' | 'rendering' | 'delivering' | 'paused'
  startDate: string
  endDate: string
  manager: string
  // 甘特图数据：每一天的任务安排
  schedule: { [date: string]: TaskCell }
}

const ProjectGantt: React.FC = () => {
  const [baseDate, setBaseDate] = useState(dayjs('2025-05-26'))
  const [timeRangeMode, setTimeRangeMode] = useState(7) // 默认7天模式
  const [slidePosition, setSlidePosition] = useState(0) // 滑块位置
  const [editingCell, setEditingCell] = useState<{ projectId: string, date: string } | null>(null)
  const [editForm, setEditForm] = useState<{ type: string, count: number, note: string }>({
    type: 'M',
    count: 1,
    note: ''
  })
  
  // 多状态筛选
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)

  // 获取今日日期
  const today = dayjs().format('YYYY-MM-DD')
  
  // 模拟项目数据，包含完整的3阶段流程
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'NF0805',
      name: '120 Bathurst St',
      client: 'Bathurst开发公司',
      status: 'paused',
      startDate: '2025-05-26',
      endDate: '2025-06-30',
      manager: '张经理',
      schedule: {
        '2025-05-26': { type: 'P', note: '暂停' },
        '2025-05-27': { type: 'P', note: '暂停' },
        '2025-05-28': { type: 'P', note: '暂停' },
        '2025-05-29': { type: 'P', note: '暂停' },
      },
    },
    {
      id: 'NF0806',
      name: 'NCCEC',
      client: 'NCCEC集团',
      status: 'modeling',
      startDate: '2025-05-26',
      endDate: '2025-07-15',
      manager: '李经理',
      schedule: {
        '2025-05-26': { type: 'M', count: 3 },
        '2025-05-27': { type: 'M', count: 2 },
        '2025-05-28': { type: 'M', count: 4 },
      },
    },
    {
      id: 'NF0808',
      name: 'Norwell',
      client: 'Norwell置业',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-06-10',
      manager: '王经理',
      schedule: {
        '2025-05-26': { type: 'M', count: 4 },
        '2025-05-27': { type: 'R', count: 4 },
        '2025-05-28': { type: 'F', count: 4 },
      },
    },
    {
      id: 'NF0809',
      name: 'Jasper R2',
      client: 'Jasper开发有限公司',
      status: 'modeling',
      startDate: '2025-05-26',
      endDate: '2025-07-05',
      manager: '赵经理',
      schedule: {
        '2025-05-26': { type: 'M', count: 2 },
        '2025-05-27': { type: 'M', count: 3 },
      },
    },
    {
      id: 'NF0810',
      name: 'Warsan Logistics Park R2',
      client: '物流园区开发商',
      status: 'rendering',
      startDate: '2025-05-26',
      endDate: '2025-08-15',
      manager: '张建模',
      schedule: {
        '2025-05-26': { type: 'M', count: 6 },
        '2025-05-27': { type: 'R', count: 6 },
        '2025-05-28': { type: 'R', count: 4 },
      },
    },
    {
      id: 'NF0811',
      name: 'AMSQ',
      client: 'AMSQ集团',
      status: 'modeling',
      startDate: '2025-05-26',
      endDate: '2025-09-20',
      manager: '李动画',
      schedule: {
        '2025-05-26': { type: 'M', count: 2 },
        '2025-05-27': { type: 'M', count: 1 },
      },
    },
    {
      id: 'NF0812',
      name: 'PUMPKIN',
      client: '南瓜置业',
      status: 'rendering',
      startDate: '2025-05-26',
      endDate: '2025-07-30',
      manager: '王渲染',
      schedule: {
        '2025-05-26': { type: 'M', count: 3 },
        '2025-05-27': { type: 'R', count: 3 },
        '2025-05-28': { type: 'R', count: 2 },
      },
    },
    {
      id: 'NF0813',
      name: '47-49 Fitzroy St',
      client: 'Fitzroy开发有限公司',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-06-10',
      manager: '赵交付',
      schedule: {
        '2025-05-26': { type: 'M', count: 3 },
        '2025-05-27': { type: 'R', count: 3 },
        '2025-05-28': { type: 'F', count: 3 },
      },
    },
    {
      id: 'NF0814',
      name: 'Airlie Beach - 等反璟',
      client: '海滨度假村集团',
      status: 'rendering',
      startDate: '2025-05-26',
      endDate: '2025-07-15',
      manager: '陈度假',
      schedule: {
        '2025-05-26': { type: 'M', count: 5 },
        '2025-05-27': { type: 'R', count: 5 },
        '2025-05-28': { type: 'R', count: 3 },
      },
    },
    {
      id: 'NF0815',
      name: 'UCM COB3',
      client: 'UCM建设集团',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-08-30',
      manager: '刘建设',
      schedule: {
        '2025-05-26': { type: 'R', count: 8 },
        '2025-05-27': { type: 'R', count: 2 },
        '2025-05-28': { type: 'F', count: 8 },
      },
    },
    {
      id: 'NF0816',
      name: 'Parcel 5',
      client: '土地开发商',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-07-10',
      manager: '孙土地',
      schedule: {
        '2025-05-26': { type: 'R', count: 5 },
        '2025-05-27': { type: 'F', count: 5 },
      },
    },
    {
      id: 'NF0817',
      name: '281 Springvale Rd R3',
      client: 'Springvale开发公司',
      status: 'paused',
      startDate: '2025-05-26',
      endDate: '2025-07-28',
      manager: '马道路',
      schedule: {
        '2025-05-26': { type: 'P', note: '暂停' },
        '2025-05-27': { type: 'P', note: '暂停' },
        '2025-05-28': { type: 'P', note: '暂停' },
      },
    },
    {
      id: 'NF0818',
      name: 'North Gosford R3',
      client: 'Gosford市政府',
      status: 'modeling',
      startDate: '2025-05-26',
      endDate: '2025-06-20',
      manager: '牛市政',
      schedule: {
        '2025-05-26': { type: 'notice', note: '片' },
        '2025-05-27': { type: 'M', count: 1 },
      },
    },
    {
      id: 'NF0819',
      name: 'Parcel 5 Unit',
      client: '单元开发商',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-07-15',
      manager: '羊单元',
      schedule: {
        '2025-05-26': { type: 'R', count: 5 },
        '2025-05-27': { type: 'F', count: 5 },
      },
    },
    {
      id: 'NF0820',
      name: 'OASIS Broadbeach R2',
      client: 'OASIS置业集团',
      status: 'rendering',
      startDate: '2025-05-26',
      endDate: '2025-06-30',
      manager: '猴海滨',
      schedule: {
        '2025-05-26': { type: 'M', count: 2 },
        '2025-05-27': { type: 'R', count: 2 },
        '2025-05-28': { type: 'notice', note: '等反璟' },
      },
    },
    {
      id: 'NF0821',
      name: '5 Martin Place',
      client: 'Martin Place开发商',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-07-15',
      manager: '鸡商业',
      schedule: {
        '2025-05-26': { type: 'M', count: 6 },
        '2025-05-27': { type: 'R', count: 6 },
        '2025-05-28': { type: 'R', count: 6 },
        '2025-05-29': { type: 'F', count: 6 },
      },
    },
    {
      id: 'NF0822',
      name: '20 Bridge Street',
      client: 'Bridge Street投资公司',
      status: 'modeling',
      startDate: '2025-05-26',
      endDate: '2025-08-20',
      manager: '狗桥梁',
      schedule: {
        '2025-05-26': { type: 'M', count: 2 },
        '2025-05-27': { type: 'M', count: 3 },
      },
    },
    {
      id: 'NF0823',
      name: 'BRIC R4',
      client: 'BRIC开发集团',
      status: 'modeling',
      startDate: '2025-05-26',
      endDate: '2025-08-10',
      manager: '猪综合',
      schedule: {
        '2025-05-26': { type: 'M', count: 1 },
        '2025-05-27': { type: 'M', count: 1 },
        '2025-05-28': { type: 'M', count: 1 },
        '2025-05-29': { type: 'M', count: 1 },
      },
    },
    {
      id: 'NF0824',
      name: 'Cabrillo College R3',
      client: 'Cabrillo学院',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-06-25',
      manager: '鼠教育',
      schedule: {
        '2025-05-26': { type: 'R', count: 1 },
        '2025-05-27': { type: 'R', count: 1 },
        '2025-05-28': { type: 'R', count: 1 },
        '2025-05-29': { type: 'F', count: 1 },
      },
    },
    {
      id: 'NF0825',
      name: '332-342 Old Cleveland Road',
      client: 'Cleveland Road开发商',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-07-05',
      manager: '虎道路',
      schedule: {
        '2025-05-27': { type: 'M', count: 1 },
        '2025-05-28': { type: 'R', count: 1 },
        '2025-05-29': { type: 'F', count: 1 },
      },
    },
    {
      id: 'NF0826',
      name: 'Olympic Club',
      client: 'Olympic俱乐部',
      status: 'rendering',
      startDate: '2025-05-26',
      endDate: '2025-08-20',
      manager: '兔体育',
      schedule: {
        '2025-05-26': { type: 'M', count: 1 },
        '2025-05-27': { type: 'notice', note: '等反璟' },
        '2025-05-28': { type: 'R', count: 2 },
        '2025-05-29': { type: 'F', count: 1 },
      },
    },
    {
      id: 'NF0827',
      name: 'SF Workplace R2',
      client: 'SF办公开发',
      status: 'delivering',
      startDate: '2025-05-26',
      endDate: '2025-06-10',
      manager: '龙办公',
      schedule: {
        '2025-05-27': { type: 'M', count: 1 },
        '2025-05-28': { type: 'R', count: 1 },
        '2025-05-29': { type: 'F', count: 1 },
      },
    },
  ])

  const maxSlidePosition = 60 // 最多可以滑动60天

  // 状态配置 - 添加暂停状态
  const statusConfig = {
    reporting: { color: '#d9d9d9', text: '报备中' },
    modeling: { color: '#fadb14', text: '建模中' },  // 黄色
    rendering: { color: '#52c41a', text: '渲染中' }, // 绿色
    delivering: { color: '#ff4d4f', text: '出图中' }, // 红色
    paused: { color: '#8c8c8c', text: '暂停' }, // 灰色
  }

  // 获取任务单元格的样式和内容
  const getTaskCellStyle = (task: TaskCell) => {
    switch (task.type) {
      case 'M': // 模型
        return {
          backgroundColor: '#fadb14', // 黄色
          color: '#000',
          content: `M(${task.count})`,
        }
      case 'R': // 渲染
        return {
          backgroundColor: '#52c41a', // 绿色
          color: '#fff',
          content: `R(${task.count})`,
        }
      case 'F': // 出图
        return {
          backgroundColor: '#ff4d4f', // 红色
          color: '#fff',
          content: `F(${task.count})`,
        }
      case 'P': // 暂停
        return {
          backgroundColor: '#8c8c8c', // 灰色
          color: '#fff',
          content: '暂停',
        }
      case 'notice': // 备注
        return {
          backgroundColor: '#f0f0f0',
          color: '#666',
          content: task.note || '',
        }
      default:
        return {
          backgroundColor: 'transparent',
          color: '#666',
          content: '',
        }
    }
  }

  // 智能调整F任务逻辑
  const adjustScheduleLogic = (projectId: string, targetDate: string, newTask: TaskCell) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return {}

    const schedule = { ...project.schedule }
    
    // 如果新任务是F类型，检查之前是否有F任务，自动转换为R
    if (newTask.type === 'F') {
      const dates = Object.keys(schedule).sort()
      const targetIndex = dates.indexOf(targetDate)
      
      // 检查目标日期之前的所有F任务，转换为R
      for (let i = 0; i < targetIndex; i++) {
        const date = dates[i]
        const task = schedule[date]
        if (task && task.type === 'F') {
          schedule[date] = {
            ...task,
            type: 'R'
          }
        }
      }
    }
    
    return schedule
  }

  // 根据时间模式计算显示天数
  const getViewRange = () => {
    const mode = TIME_RANGE_MODES.find(m => m.value === timeRangeMode)
    return mode ? Math.min(mode.days, 30) : 7 // 最多显示30天
  }

  const viewRange = getViewRange()

  // 生成当前视图的时间轴
  const generateTimeScale = () => {
    const days = []
    let currentDate = baseDate.clone().add(slidePosition, 'day')
    
    for (let i = 0; i < viewRange; i++) {
      days.push({
        date: currentDate.format('YYYY-MM-DD'),
        dayName: currentDate.format('ddd'), // Mon, Tue, Wed...
        monthDay: currentDate.format('MM-DD'),
        fullDate: currentDate.format('YYYY-M-D'),
        isWeekend: currentDate.day() === 0 || currentDate.day() === 6,
        isToday: currentDate.format('YYYY-MM-DD') === today,
      })
      currentDate = currentDate.add(1, 'day')
    }
    
    return days
  }

  const timeScale = generateTimeScale()

  // 获取当前显示的日期范围
  const getDateRangeText = () => {
    const startDate = baseDate.add(slidePosition, 'day')
    const endDate = baseDate.add(slidePosition + viewRange - 1, 'day')
    
    if (startDate.year() === endDate.year() && startDate.month() === endDate.month()) {
      // 同月：5月26日-6月2日
      return `${startDate.format('M月D日')}-${endDate.format('D日')}`
    } else if (startDate.year() === endDate.year()) {
      // 同年不同月：5月26日-6月2日
      return `${startDate.format('M月D日')}-${endDate.format('M月D日')}`
    } else {
      // 跨年：2024年12月26日-2025年1月2日
      return `${startDate.format('YYYY年M月D日')}-${endDate.format('YYYY年M月D日')}`
    }
  }

  // 获取项目已有任务的数量（用于继承）
  const getInheritedCount = (projectId: string): number => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return 1

    const schedule = project.schedule
    const dates = Object.keys(schedule).sort()
    
    // 按优先级查找数量：M > R > F
    for (const date of dates) {
      const task = schedule[date]
      if (task && task.count && ['M', 'R', 'F'].includes(task.type)) {
        return task.count
      }
    }
    
    return 1
  }

  // 过滤项目
  const filteredProjects = projects.filter(project => {
    // 多状态筛选逻辑
    if (selectedStatuses.length > 0) {
      return selectedStatuses.includes(project.status)
    }
    return true
  })

  // 处理单元格编辑
  const handleCellEdit = (projectId: string, date: string, currentTask?: TaskCell) => {
    setEditingCell({ projectId, date })
    if (currentTask) {
      setEditForm({
        type: currentTask.type === 'notice' ? 'M' : currentTask.type,
        count: currentTask.count || 1,
        note: currentTask.note || ''
      })
    } else {
      // 新建任务时，智能继承项目已有任务的数量
      const inheritedCount = getInheritedCount(projectId)
      setEditForm({ 
        type: 'M', 
        count: inheritedCount, 
        note: '' 
      })
    }
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingCell) return

    const updatedProjects = projects.map(project => {
      if (project.id === editingCell.projectId) {
        let newSchedule = { ...project.schedule }
        
        if (editForm.type === 'empty') {
          // 删除任务
          delete newSchedule[editingCell.date]
        } else {
          // 创建新任务
          const newTask: TaskCell = {
            type: editForm.type as TaskCell['type'],
            count: editForm.type === 'notice' || editForm.type === 'P' ? undefined : editForm.count,
            note: editForm.type === 'notice' || editForm.type === 'P' ? editForm.note || '暂停' : undefined
          }
          
          // 应用智能调整逻辑
          newSchedule = adjustScheduleLogic(editingCell.projectId, editingCell.date, newTask)
          
          // 更新或创建任务
          newSchedule[editingCell.date] = newTask
        }
        
        return { ...project, schedule: newSchedule }
      }
      return project
    })

    setProjects(updatedProjects)
    setEditingCell(null)
    message.success('任务已更新')
  }

  // 构建表格列
  const buildColumns = (): ColumnsType<Project> => {
    const baseColumns: ColumnsType<Project> = [
      {
        title: 'Project Name',
        key: 'project',
        width: 250,
        fixed: 'left',
        render: (_, record) => (
          <div style={{ fontSize: '13px' }}>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{record.id}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.name}</div>
          </div>
        ),
      },
    ]

    // 为每一天创建一列
    const dateColumns: ColumnsType<Project> = timeScale.map((day) => ({
      title: (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '12px',
          backgroundColor: day.isToday ? '#fff7e6' : 'transparent',
          padding: '8px 4px',
          borderRadius: '4px',
          border: day.isToday ? '2px solid #faad14' : 'none',
          position: 'relative'
        }}>
          <div style={{ 
            fontWeight: 600, 
            color: day.isToday ? '#fa8c16' : '#000'
          }}>
            {day.dayName}
            {day.isToday && (
              <span style={{ 
                fontSize: '10px', 
                color: '#fa8c16', 
                marginLeft: '4px',
                fontWeight: 'bold'
              }}>
                今日
              </span>
            )}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: day.isToday ? '#fa8c16' : '#666' 
          }}>
            {day.fullDate}
          </div>
          {day.isToday && (
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              backgroundColor: '#fa8c16',
              borderRadius: '50%'
            }} />
          )}
        </div>
      ),
      key: day.date,
      width: 100,
      className: day.isToday ? 'today-column' : '',
      render: (_, record) => {
        const task = record.schedule[day.date]
        
        if (!task) {
          return (
            <div 
              style={{ 
                height: '30px', 
                textAlign: 'center', 
                cursor: 'pointer',
                border: '1px dashed transparent',
                borderRadius: '2px'
              }}
              onClick={() => handleCellEdit(record.id, day.date)}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px dashed #d9d9d9'
                e.currentTarget.style.backgroundColor = '#fafafa'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px dashed transparent'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              +
            </div>
          )
        }

        const cellStyle = getTaskCellStyle(task)
        return (
          <div
            style={{
              backgroundColor: cellStyle.backgroundColor,
              color: cellStyle.color,
              padding: '4px 8px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '500',
              borderRadius: '2px',
              height: '30px',
              lineHeight: '22px',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => handleCellEdit(record.id, day.date, task)}
          >
            {cellStyle.content}
            <EditOutlined 
              style={{ 
                position: 'absolute', 
                top: 2, 
                right: 2, 
                fontSize: '8px',
                opacity: 0.6
              }} 
            />
          </div>
        )
      },
    }))

    return [...baseColumns, ...dateColumns]
  }

  const columns = buildColumns()

  // 日期选择处理
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setBaseDate(date)
      setSlidePosition(0) // 重置滑块位置
    }
  }

  // 日期范围选择处理
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0]
      const endDate = dates[1]
      const rangeDays = endDate.diff(startDate, 'day') + 1
      
      setBaseDate(startDate)
      // 根据范围天数选择合适的模式
      if (rangeDays <= 7) {
        setTimeRangeMode(7)
      } else if (rangeDays <= 30) {
        setTimeRangeMode(30)
      } else if (rangeDays <= 90) {
        setTimeRangeMode(90)
      } else if (rangeDays <= 180) {
        setTimeRangeMode(180)
      } else {
        setTimeRangeMode(365)
      }
      setSlidePosition(0)
    }
  }

  // 时间范围模式切换
  const handleTimeRangeModeChange = (mode: number) => {
    setTimeRangeMode(mode)
    setSlidePosition(0) // 重置滑块位置
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>项目甘特图</h1>
            <p style={{ color: '#8c8c8c', margin: 0 }}>
              可视化展示项目时间轴和阶段进度 - 3阶段流程（模型→渲染→出图）
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button 
              icon={<CalendarOutlined />}
              onClick={() => {
                setBaseDate(dayjs())
                setSlidePosition(0)
              }}
              type={baseDate.format('YYYY-MM-DD') === today ? 'primary' : 'default'}
            >
              回到今天
            </Button>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        {/* 筛选控件 */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 时间范围模式选择 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#fa8c16' }} />
            <span style={{ fontSize: '14px', color: '#666', minWidth: '80px' }}>时间范围:</span>
            <Select
              value={timeRangeMode}
              onChange={handleTimeRangeModeChange}
              style={{ width: 120 }}
            >
              {TIME_RANGE_MODES.map(mode => (
                <Option key={mode.value} value={mode.value}>
                  {mode.label}
                </Option>
              ))}
            </Select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontSize: '14px', color: '#666', minWidth: '60px' }}>起始日期:</span>
            <DatePicker
              value={baseDate}
              onChange={handleDateChange}
              format="YYYY年M月D日"
              placeholder="选择起始日期"
              style={{ width: 140 }}
              allowClear={false}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontSize: '14px', color: '#666', minWidth: '60px' }}>日期范围:</span>
            <RangePicker
              onChange={handleDateRangeChange}
              format="M月D日"
              placeholder={['开始日期', '结束日期']}
              style={{ width: 200 }}
              presets={[
                { label: '近7天', value: [dayjs(), dayjs().add(6, 'day')] },
                { label: '近14天', value: [dayjs(), dayjs().add(13, 'day')] },
                { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: '下月', value: [dayjs().add(1, 'month').startOf('month'), dayjs().add(1, 'month').endOf('month')] },
              ]}
            />
          </div>

          {/* 多状态筛选 */}
          <Popover
            content={
              <div style={{ width: 250 }}>
                <div style={{ marginBottom: 16 }}>
                  <strong>选择要显示的项目状态：</strong>
                </div>
                <Checkbox.Group
                  value={selectedStatuses}
                  onChange={setSelectedStatuses}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <Checkbox value="reporting">
                    <Tag color="default">报备中</Tag>
                  </Checkbox>
                  <Checkbox value="modeling">
                    <Tag color="warning">建模中</Tag>
                  </Checkbox>
                  <Checkbox value="rendering">
                    <Tag color="success">渲染中</Tag>
                  </Checkbox>
                  <Checkbox value="delivering">
                    <Tag color="error">出图中</Tag>
                  </Checkbox>
                  <Checkbox value="paused">
                    <Tag color="default">暂停</Tag>
                  </Checkbox>
                </Checkbox.Group>
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedStatuses([])}
                  >
                    清空
                  </Button>
                  <Button 
                    size="small" 
                    type="primary"
                    onClick={() => setSelectedStatuses(['reporting', 'modeling', 'rendering', 'delivering', 'paused'])}
                  >
                    全选
                  </Button>
                </div>
              </div>
            }
            title="状态筛选"
            trigger="click"
            open={showAdvancedFilter}
            onOpenChange={setShowAdvancedFilter}
          >
            <Button 
              icon={<FilterOutlined />}
              type={selectedStatuses.length > 0 ? 'primary' : 'default'}
            >
              更多筛选 {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
            </Button>
          </Popover>
        </div>

        {/* 时间滑块控制 */}
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #e9ecef'
        }}>
          {/* 快速选择按钮 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Button 
              size="small" 
              onClick={() => {
                setBaseDate(dayjs())
                setSlidePosition(0)
              }}
              type={baseDate.format('YYYY-MM-DD') === today ? 'primary' : 'default'}
            >
              今天
            </Button>
            <Button 
              size="small" 
              onClick={() => {
                setBaseDate(dayjs().startOf('week'))
                setTimeRangeMode(7)
                setSlidePosition(0)
              }}
            >
              本周
            </Button>
            <Button 
              size="small" 
              onClick={() => {
                setBaseDate(dayjs().startOf('month'))
                setTimeRangeMode(30)
                setSlidePosition(0)
              }}
            >
              本月
            </Button>
            <Button 
              size="small" 
              onClick={() => {
                setBaseDate(dayjs().add(1, 'week').startOf('week'))
                setTimeRangeMode(7)
                setSlidePosition(0)
              }}
            >
              下周
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <Button 
              icon={<LeftOutlined />} 
              size="small"
              onClick={() => setSlidePosition(Math.max(0, slidePosition - 1))}
              disabled={slidePosition === 0}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  当前显示: {getDateRangeText()}
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  第 {slidePosition + 1} - {slidePosition + viewRange} 天
                </span>
              </div>
              <Slider
                min={0}
                max={maxSlidePosition}
                value={slidePosition}
                onChange={setSlidePosition}
                tooltip={{
                  formatter: (value) => `第${(value || 0) + 1}天`
                }}
              />
            </div>
            <Button 
              icon={<RightOutlined />} 
              size="small"
              onClick={() => setSlidePosition(Math.min(maxSlidePosition, slidePosition + 1))}
              disabled={slidePosition >= maxSlidePosition}
            />
          </div>
        </div>

        {/* 状态说明 */}
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: '#fafafa', 
          borderRadius: 8,
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 20, 
                height: 16, 
                backgroundColor: '#fadb14', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>M</div>
              <span style={{ fontSize: 12 }}>模型阶段</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 20, 
                height: 16, 
                backgroundColor: '#52c41a', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#fff'
              }}>R</div>
              <span style={{ fontSize: 12 }}>渲染阶段</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 20, 
                height: 16, 
                backgroundColor: '#ff4d4f', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#fff'
              }}>F</div>
              <span style={{ fontSize: 12 }}>出图阶段（1天）</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 20, 
                height: 16, 
                backgroundColor: '#8c8c8c', 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 'bold',
                color: '#fff'
              }}>P</div>
              <span style={{ fontSize: 12 }}>暂停状态</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            💡 智能功能：新建任务自动继承数量 | 设置F时自动调整之前的F为R
            {selectedStatuses.length > 0 && (
              <span style={{ color: '#1890ff', marginLeft: 8 }}>
                | 已筛选 {selectedStatuses.length} 种状态
              </span>
            )}
          </div>
        </div>

        {/* 甘特图表格 */}
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <Table
            columns={columns}
            dataSource={filteredProjects}
            rowKey="id"
            pagination={false}
            scroll={{ x: Math.max(1200, 250 + timeScale.length * 100) }}
            size="small"
            bordered
            className="gantt-table"
          />
        </div>

        {/* 编辑任务弹窗 */}
        <Modal
          title="编辑任务"
          open={!!editingCell}
          onOk={handleSaveEdit}
          onCancel={() => setEditingCell(null)}
          width={400}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>任务类型</label>
            <Select
              value={editForm.type}
              onChange={(value) => setEditForm({ ...editForm, type: value })}
              style={{ width: '100%' }}
            >
              <Option value="M">M - 模型</Option>
              <Option value="R">R - 渲染</Option>
              <Option value="F">F - 出图</Option>
              <Option value="P">P - 暂停</Option>
              <Option value="notice">备注</Option>
              <Option value="empty">删除任务</Option>
            </Select>
          </div>

          {editForm.type !== 'notice' && editForm.type !== 'empty' && editForm.type !== 'P' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>数量</label>
              <InputNumber
                min={1}
                max={99}
                value={editForm.count}
                onChange={(value) => setEditForm({ ...editForm, count: value || 1 })}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {(editForm.type === 'notice' || editForm.type === 'P') && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>
                {editForm.type === 'P' ? '暂停原因' : '备注内容'}
              </label>
              <Input
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                placeholder={editForm.type === 'P' ? '请输入暂停原因' : '请输入备注内容'}
              />
            </div>
          )}

          {editingCell && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
              编辑项目: {editingCell.projectId} - {editingCell.date}
              {editForm.type === 'F' && (
                <div style={{ color: '#fa8c16', marginTop: 4 }}>
                  ⚠️ 设置F任务时，之前的F任务将自动转为R任务
                </div>
              )}
              {!projects.find(p => p.id === editingCell.projectId)?.schedule[editingCell.date] && (
                <div style={{ color: '#52c41a', marginTop: 4 }}>
                  💡 已自动继承项目任务数量 ({editForm.count})
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default ProjectGantt 
import React, { useState } from 'react'
import { Button, Select, Checkbox, message } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

// 导入类型定义
import { GanttProject, TaskCell } from '../types/project'

// 导入组件
import GanttTimeController from '../components/gantt/GanttTimeController'
import GanttTable from '../components/gantt/GanttTable'
import TaskEditor from '../components/gantt/TaskEditor'

const { Option } = Select

const ProjectGantt: React.FC = () => {
  const [baseDate, setBaseDate] = useState(dayjs('2025-05-26'))
  const [timeRangeMode, setTimeRangeMode] = useState(7) // 默认7天模式
  const [slidePosition, setSlidePosition] = useState(0) // 滑块位置
  const [editingCell, setEditingCell] = useState<{ projectId: string, date: string } | null>(null)
  const [editForm, setEditForm] = useState<{ type: string, count: number, note: string, animationSeconds?: number }>({
    type: 'M',
    count: 1,
    note: '',
    animationSeconds: 0
  })
  
  // 多状态筛选
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)

  // 获取今日日期
  const today = dayjs().format('YYYY-MM-DD')
  
  // 模拟项目数据，包含完整的3阶段流程
  const [projects, setProjects] = useState<GanttProject[]>([
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
      endDate: '2025-07-20',
      manager: '土地经理',
      schedule: {
        '2025-05-26': { type: 'F', count: 2 },
        '2025-05-27': { type: 'F', count: 3 },
        '2025-05-28': { type: 'F', count: 1 },
      },
    },
  ])

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0]) {
      setBaseDate(dates[0])
      setSlidePosition(0)
    }
  }

  // 处理时间范围模式变化
  const handleTimeRangeModeChange = (mode: number) => {
    setTimeRangeMode(mode)
    setSlidePosition(0) // 重置滑块位置
  }

  // 处理单元格编辑
  const handleCellEdit = (projectId: string, date: string, currentTask?: TaskCell) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setEditingCell({ projectId, date })
    
    if (currentTask) {
      setEditForm({
        type: currentTask.type,
        count: currentTask.count || 1,
        note: currentTask.note || '',
        animationSeconds: currentTask.animationSeconds || 0
      })
    } else {
      setEditForm({
        type: 'M',
        count: 1,
        note: '',
        animationSeconds: 0
      })
    }
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingCell) return

    const updatedProjects = projects.map(project => {
      if (project.id === editingCell.projectId) {
        const newSchedule = { ...project.schedule }
        
        if (editForm.type === 'empty') {
          delete newSchedule[editingCell.date]
        } else {
          newSchedule[editingCell.date] = {
            type: editForm.type as TaskCell['type'],
            count: editForm.type === 'notice' ? undefined : editForm.count,
            note: editForm.note || undefined,
            animationSeconds: editForm.animationSeconds || undefined
          }
        }
        
        return { ...project, schedule: newSchedule }
      }
      return project
    })

    setProjects(updatedProjects)
    setEditingCell(null)
    message.success('任务更新成功')
  }

  // 智能默认功能：应用到后续阶段
  const handleSmartDefault = (type: string, count: number) => {
    if (!editingCell) return

    const project = projects.find(p => p.id === editingCell.projectId)
    if (!project) return

    const currentDate = dayjs(editingCell.date)
    const stageOrder = ['M', 'R', 'F'] // 阶段顺序
    const currentStageIndex = stageOrder.indexOf(type)
    
    if (currentStageIndex === -1) return

    const updatedProjects = projects.map(proj => {
      if (proj.id === editingCell.projectId) {
        const newSchedule = { ...proj.schedule }
        
        // 查找后续的空白日期，按阶段顺序填充
        let nextStageIndex = currentStageIndex + 1
        let searchDate = currentDate.add(1, 'day')
        
        // 最多向后查找30天
        for (let i = 0; i < 30 && nextStageIndex < stageOrder.length; i++) {
          const dateStr = searchDate.format('YYYY-MM-DD')
          
          // 如果该日期没有任务，设置为下一阶段
          if (!newSchedule[dateStr]) {
            newSchedule[dateStr] = {
              type: stageOrder[nextStageIndex] as TaskCell['type'],
              count: count,
              note: `自动设置 (${count})`
            }
            nextStageIndex++
          }
          
          searchDate = searchDate.add(1, 'day')
        }
        
        return { ...proj, schedule: newSchedule }
      }
      return proj
    })

    setProjects(updatedProjects)
    message.success(`已自动设置后续阶段，数量：${count}`)
  }

  // 批量应用任务
  const handleBatchApply = (startDate: string, type: string, count: number, duration: number, note: string, animationSeconds?: number) => {
    if (!editingCell) return

    const updatedProjects = projects.map(project => {
      if (project.id === editingCell.projectId) {
        const newSchedule = { ...project.schedule }
        
        // 为连续的日期设置任务
        for (let i = 0; i < duration; i++) {
          const currentDate = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD')
          
          if (type === 'empty') {
            delete newSchedule[currentDate]
          } else {
            newSchedule[currentDate] = {
              type: type as TaskCell['type'],
              count: type === 'notice' ? undefined : count,
              note: note || undefined,
              animationSeconds: animationSeconds || undefined
            }
          }
        }
        
        return { ...project, schedule: newSchedule }
      }
      return project
    })

    setProjects(updatedProjects)
    setEditingCell(null)
    const animationText = animationSeconds ? ` (含${animationSeconds}秒动画)` : ''
    message.success(`已成功设置 ${duration} 天的任务计划${animationText}`)
  }

  // 状态筛选选项
  const statusOptions = [
    { label: '报备中', value: 'reporting' },
    { label: '建模', value: 'modeling' },
    { label: '渲染', value: 'rendering' },
    { label: '出图', value: 'delivering' },
    { label: '暂停', value: 'paused' },
  ]

  // 获取当前编辑的项目信息
  const getCurrentEditingProject = () => {
    if (!editingCell) return null
    return projects.find(p => p.id === editingCell.projectId)
  }

  const currentEditingProject = getCurrentEditingProject()

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>项目甘特图</h1>
            <p style={{ color: '#8c8c8c', marginTop: 8 }}>
              可视化项目进度和时间安排，支持实时编辑任务
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              type={showAdvancedFilter ? 'primary' : 'default'}
            >
              高级筛选
            </Button>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        {/* 高级筛选面板 */}
        {showAdvancedFilter && (
          <div style={{
            background: '#fff',
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 500, marginRight: 12 }}>项目状态筛选：</span>
              <Checkbox.Group
                options={statusOptions}
                value={selectedStatuses}
                onChange={setSelectedStatuses}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              已选择 {selectedStatuses.length} 个状态，
              显示 {projects.filter(p => selectedStatuses.length === 0 || selectedStatuses.includes(p.status)).length} 个项目
            </div>
          </div>
        )}

        {/* 时间控制器 */}
        <GanttTimeController
          baseDate={baseDate}
          timeRangeMode={timeRangeMode}
          slidePosition={slidePosition}
          onBaseDateChange={setBaseDate}
          onTimeRangeModeChange={handleTimeRangeModeChange}
          onSlidePositionChange={setSlidePosition}
          onDateRangeChange={handleDateRangeChange}
        />

        {/* 甘特图表格 */}
        <GanttTable
          projects={projects}
          baseDate={baseDate}
          slidePosition={slidePosition}
          selectedStatuses={selectedStatuses}
          today={today}
          onCellEdit={handleCellEdit}
        />

        {/* 任务编辑器 */}
        <TaskEditor
          visible={!!editingCell}
          projectName={currentEditingProject?.name}
          date={editingCell?.date}
          currentTask={currentEditingProject?.schedule[editingCell?.date || '']}
          editForm={editForm}
          onFormChange={setEditForm}
          onSave={handleSaveEdit}
          onCancel={() => setEditingCell(null)}
          onBatchApply={handleBatchApply}
          onSmartDefault={handleSmartDefault}
        />

        {/* 图例说明 */}
        <div style={{
          background: '#fff',
          padding: 16,
          borderRadius: 8,
          marginTop: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ marginBottom: 12 }}>图例说明</h4>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#fa8c16'
              }} />
              <span>建模 (M)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#52c41a'
              }} />
              <span>渲染 (R)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#dc143c'
              }} />
              <span>出图 (F)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#8c8c8c'
              }} />
              <span>暂停 (P)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#722ed1'
              }} />
              <span>备注 (!)</span>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
            点击任意单元格可编辑任务，数字表示任务数量，悬浮显示备注信息
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectGantt 
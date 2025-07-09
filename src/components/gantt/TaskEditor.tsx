import React from 'react'
import { Modal, Select, InputNumber, Input, Button, Space, DatePicker, Divider } from 'antd'
import { TaskCell } from '../../types/project'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface TaskEditorProps {
  visible: boolean
  projectName?: string
  date?: string
  currentTask?: TaskCell
  editForm: {
    type: string
    count: number
    note: string
  }
  onFormChange: (form: { type: string; count: number; note: string }) => void
  onSave: () => void
  onCancel: () => void
  onBatchApply?: (startDate: string, type: string, count: number, duration: number, note: string) => void
}

const TaskEditor: React.FC<TaskEditorProps> = ({
  visible,
  projectName,
  date,
  currentTask,
  editForm,
  onFormChange,
  onSave,
  onCancel,
  onBatchApply
}) => {
  const [batchMode, setBatchMode] = React.useState(false)
  const [batchStartDate, setBatchStartDate] = React.useState<dayjs.Dayjs | null>(
    date ? dayjs(date) : dayjs()
  )
  const [batchDuration, setBatchDuration] = React.useState(3)

  const taskTypeOptions = [
    { value: 'M', label: '建模 (M)', color: '#fa8c16' },
    { value: 'R', label: '渲染 (R)', color: '#52c41a' },
    { value: 'F', label: '出图 (F)', color: '#dc143c' },
    { value: 'P', label: '暂停 (P)', color: '#8c8c8c' },
    { value: 'notice', label: '备注', color: '#722ed1' },
    { value: 'empty', label: '清空', color: '#d9d9d9' },
  ]

  const handleTypeChange = (type: string) => {
    onFormChange({
      ...editForm,
      type,
      count: type === 'empty' ? 0 : editForm.count
    })
  }

  const handleCountChange = (count: number | null) => {
    onFormChange({
      ...editForm,
      count: count || 0
    })
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormChange({
      ...editForm,
      note: e.target.value
    })
  }

  const handleBatchApply = () => {
    if (onBatchApply && batchStartDate) {
      onBatchApply(
        batchStartDate.format('YYYY-MM-DD'),
        editForm.type,
        editForm.count,
        batchDuration,
        editForm.note
      )
    }
  }

  const getTaskTypeColor = (type: string) => {
    const option = taskTypeOptions.find(opt => opt.value === type)
    return option?.color || '#d9d9d9'
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{batchMode ? '批量设置任务' : '编辑任务'}</span>
          {projectName && !batchMode && (
            <span style={{ fontSize: '14px', color: '#8c8c8c' }}>
              - {projectName} ({date})
            </span>
          )}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="mode" 
          type={batchMode ? 'default' : 'dashed'}
          onClick={() => setBatchMode(!batchMode)}
        >
          {batchMode ? '单个设置' : '批量设置'}
        </Button>,
        batchMode ? (
          <Button key="batchApply" type="primary" onClick={handleBatchApply}>
            批量应用
          </Button>
        ) : (
          <Button key="save" type="primary" onClick={onSave}>
            保存
          </Button>
        ),
      ]}
    >
      <div style={{ padding: '16px 0' }}>
        {!batchMode && currentTask && (
          <div style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 6,
            marginBottom: 16
          }}>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
              当前任务：
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getTaskTypeColor(currentTask.type)
                }}
              />
              <span>
                {taskTypeOptions.find(opt => opt.value === currentTask.type)?.label || currentTask.type}
                {currentTask.count && ` (${currentTask.count})`}
              </span>
              {currentTask.note && (
                <span style={{ color: '#8c8c8c' }}>- {currentTask.note}</span>
              )}
            </div>
          </div>
        )}

        {batchMode && (
          <>
            <div style={{
              background: '#e6f7ff',
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
              border: '1px solid #91d5ff'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#0050b3', marginBottom: 8 }}>
                🚀 批量设置模式
              </div>
              <div style={{ fontSize: '12px', color: '#1890ff' }}>
                选择起始日期和持续天数，系统将自动为连续的日期设置相同的任务类型
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                起始日期：
              </label>
              <DatePicker
                value={batchStartDate}
                onChange={setBatchStartDate}
                style={{ width: '100%' }}
                size="large"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                持续天数：
              </label>
              <InputNumber
                value={batchDuration}
                onChange={(value) => setBatchDuration(value || 1)}
                min={1}
                max={30}
                style={{ width: '100%' }}
                size="large"
                placeholder="输入持续天数"
              />
            </div>

            <Divider style={{ margin: '16px 0' }} />
          </>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            任务类型：
          </label>
          <Select
            value={editForm.type}
            onChange={handleTypeChange}
            style={{ width: '100%' }}
            size="large"
          >
            {taskTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: option.color
                    }}
                  />
                  {option.label}
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {editForm.type !== 'empty' && editForm.type !== 'notice' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              数量：
            </label>
            <InputNumber
              value={editForm.count}
              onChange={handleCountChange}
              min={0}
              max={50}
              style={{ width: '100%' }}
              size="large"
              placeholder="请输入任务数量"
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            备注：
          </label>
          <TextArea
            value={editForm.note}
            onChange={handleNoteChange}
            rows={3}
            placeholder="请输入备注信息（可选）"
            maxLength={200}
            showCount
          />
        </div>

        {editForm.type !== 'empty' && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: '#e6f7ff',
            borderRadius: 6,
            border: '1px solid #91d5ff'
          }}>
            <div style={{ fontSize: '12px', color: '#0050b3', marginBottom: 4 }}>
              预览效果：
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: getTaskTypeColor(editForm.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {editForm.type !== 'notice' && editForm.count > 0 ? editForm.count : editForm.type}
              </div>
              <span style={{ color: '#0050b3', fontWeight: 500 }}>
                {taskTypeOptions.find(opt => opt.value === editForm.type)?.label}
                {editForm.count > 0 && editForm.type !== 'notice' && ` (${editForm.count})`}
              </span>
              {editForm.note && (
                <span style={{ color: '#0050b3' }}>- {editForm.note}</span>
              )}
            </div>
            {batchMode && batchStartDate && (
              <div style={{ marginTop: 8, fontSize: '12px', color: '#1890ff' }}>
                将应用到：{batchStartDate.format('YYYY-MM-DD')} 开始的连续 {batchDuration} 天
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default TaskEditor 
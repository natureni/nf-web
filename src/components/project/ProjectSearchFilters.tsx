import React from 'react'
import { Input, Select, Space, Button, message } from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons'
import { ProjectFilters } from '../../types/project'

const { Option } = Select

interface ProjectSearchFiltersProps {
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
  uniqueClients: string[]
}

const ProjectSearchFilters: React.FC<ProjectSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  uniqueClients
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchText: value
    })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      statusFilter: value
    })
  }

  const handleClientChange = (value: string) => {
    onFiltersChange({
      ...filters,
      clientFilter: value
    })
  }

  return (
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
          value={filters.searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="large"
          allowClear
        />
      </div>
      
      <Space size={12}>
        <Select
          placeholder="全部状态"
          allowClear
          value={filters.statusFilter}
          onChange={handleStatusChange}
          style={{ width: 120 }}
          size="large"
        >
          <Option value="">全部状态</Option>
          <Option value="reporting">报备中</Option>
          <Option value="modeling">建模</Option>
          <Option value="rendering">渲染</Option>
          <Option value="delivering">出图</Option>
          <Option value="paused">暂停</Option>
        </Select>

        <Select
          placeholder="全部客户"
          allowClear
          value={filters.clientFilter}
          onChange={handleClientChange}
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
  )
}

export default ProjectSearchFilters 
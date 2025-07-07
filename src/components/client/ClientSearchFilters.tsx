import React from 'react'
import { Input, Select, Row, Col, Button, Space } from 'antd'
import { SearchOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { ClientFilters } from '../../types/client'

const { Option } = Select

interface ClientSearchFiltersProps {
  filters: ClientFilters
  onFiltersChange: (filters: ClientFilters) => void
  onCreateClient: () => void
  onImportClients: () => void
}

const ClientSearchFilters: React.FC<ClientSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onCreateClient,
  onImportClients
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchText: value })
  }

  const handleRegionChange = (value: string) => {
    onFiltersChange({ ...filters, regionFilter: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, statusFilter: value })
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <Space size="middle" style={{ width: '100%' }}>
            <Input
              placeholder="搜索客户公司名称或联系人..."
              prefix={<SearchOutlined />}
              value={filters.searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            
            <Select
              placeholder="选择地区"
              value={filters.regionFilter || undefined}
              onChange={handleRegionChange}
              style={{ width: 180 }}
              allowClear
            >
              <Option value="Asia-Pacific">Asia-Pacific 亚太地区</Option>
              <Option value="North-America">North-America 北美</Option>
              <Option value="Europe">Europe 欧洲</Option>
              <Option value="Middle-East">Middle-East 中东</Option>
              <Option value="Other">Other 其他</Option>
            </Select>
            
            <Select
              placeholder="选择状态"
              value={filters.statusFilter || undefined}
              onChange={handleStatusChange}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="active">Active 活跃</Option>
              <Option value="inactive">Inactive 非活跃</Option>
              <Option value="potential">Potential 潜在</Option>
              <Option value="blacklist">Blacklist 黑名单</Option>
            </Select>
          </Space>
        </Col>
        
        <Col>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onCreateClient}
            >
              新建客户
            </Button>
            <Button 
              icon={<UploadOutlined />} 
              onClick={onImportClients}
            >
              批量导入
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default ClientSearchFilters 
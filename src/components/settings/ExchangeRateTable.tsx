import React from 'react'
import { Table, Tag, Space, Typography } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { ExchangeRate } from '../../types/project'

const { Text } = Typography

interface ExchangeRateTableProps {
  exchangeRates: ExchangeRate[]
}

const ExchangeRateTable: React.FC<ExchangeRateTableProps> = ({
  exchangeRates
}) => {
  const columns = [
    {
      title: '货币',
      dataIndex: 'currency',
      key: 'currency',
      render: (text: string, record: ExchangeRate) => (
        <Space>
          <span style={{ fontSize: '18px' }}>{record.flag}</span>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.currencyCode} · {record.region}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '汇率（相对人民币）',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number, record: ExchangeRate) => (
        <div>
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            {record.currencySymbol} 1 = ¥ {rate.toFixed(4)}
          </Text>
          {record.lastUpdated && (
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              更新时间: {new Date(record.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: () => (
        <Tag color="green">
          <InfoCircleOutlined /> 正常
        </Tag>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={exchangeRates}
      pagination={{ pageSize: 8 }}
      size="small"
      rowKey="currencyCode"
    />
  )
}

export default ExchangeRateTable 
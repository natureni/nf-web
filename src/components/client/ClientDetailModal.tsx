import React from 'react'
import { 
  Modal, 
  Tabs, 
  Descriptions, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Divider,
  Space 
} from 'antd'
import { 
  ProjectOutlined, 
  HeartOutlined 
} from '@ant-design/icons'
import { Client, RegionConfig } from '../../types/client'
import dayjs from 'dayjs'

const { TabPane } = Tabs

interface ClientDetailModalProps {
  visible: boolean
  client: Client | null
  onClose: () => void
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  visible,
  client,
  onClose
}) => {
  if (!client) return null

  return (
    <Modal
      title={`客户详情 - ${client.companyName}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <Tabs defaultActiveKey="basic" size="large">
        <TabPane tab="基本信息 / Basic Info" key="basic">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="公司名称 / Company" span={2}>
              <div style={{ fontWeight: 500, fontSize: 16 }}>{client.companyName}</div>
            </Descriptions.Item>
            <Descriptions.Item label="联系人 / Contact">
              <div style={{ fontWeight: 500 }}>{client.contactPerson}</div>
            </Descriptions.Item>
            <Descriptions.Item label="职位 / Title">
              {client.titleCN}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱 / Email">
              <a href={`mailto:${client.email}`}>{client.email}</a>
            </Descriptions.Item>
            <Descriptions.Item label="电话 / Phone">
              <a href={`tel:${client.phone}`}>{client.phone}</a>
            </Descriptions.Item>
            <Descriptions.Item label="网站 / Website" span={2}>
              {client.website ? (
                <a href={client.website} target="_blank" rel="noopener noreferrer">
                  {client.website}
                </a>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="客户状态 / Status">
              <Tag color={
                client.status === 'active' ? 'success' : 
                client.status === 'potential' ? 'processing' : 
                client.status === 'blacklist' ? 'error' : 'default'
              }>
                {client.status === 'active' ? 'Active 活跃' :
                 client.status === 'inactive' ? 'Inactive 非活跃' :
                 client.status === 'potential' ? 'Potential 潜在' :
                 'Blacklist 黑名单'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间 / Created">
              {dayjs(client.createdAt).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="最后联系 / Last Contact" span={2}>
              {dayjs(client.lastContact).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="客户标签 / Tags" span={2}>
              <Space wrap>
                {client.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="备注 / Notes" span={2}>
              {client.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="项目偏好 / Project Preferences" key="preferences">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="风格偏好 / Style Preferences" span={2}>
              <Space wrap>
                {Array.isArray(client.projectPreferences.style) 
                  ? client.projectPreferences.style.map(style => (
                      <Tag key={style} color="blue">{style}</Tag>
                    ))
                  : <Tag color="blue">{client.projectPreferences.style}</Tag>
                }
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="预算范围 / Budget Range">
              {client.projectPreferences.budget}
            </Descriptions.Item>
            <Descriptions.Item label="时间周期 / Timeline">
              {client.projectPreferences.timeline}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default ClientDetailModal 
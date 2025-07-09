import React from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Checkbox, Row, Col, Card, Tag } from 'antd'
import { Project } from '../../types/project'

const { Option } = Select
const { TextArea } = Input

interface ProjectBasicInfoFormProps {
  form: any
  currentProject?: Project | null
}

const ProjectBasicInfoForm: React.FC<ProjectBasicInfoFormProps> = ({
  form,
  currentProject
}) => {
  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>项目基本信息</span>
          {currentProject && (
            <Tag color="blue">正在编辑：{currentProject.name}</Tag>
          )}
        </div>
      } 
      style={{ marginTop: 24 }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="项目名称"
              name="projectName"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="项目协议号"
              name="protocolNumber"
              rules={[{ required: true, message: '请输入项目协议号' }]}
            >
              <Input placeholder="请输入项目协议号" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="客户名称"
              name="clientName"
              rules={[{ required: true, message: '请输入客户名称' }]}
            >
              <Input placeholder="请输入客户名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="项目类型"
              name="projectType"
              rules={[{ required: true, message: '请选择项目类型' }]}
            >
              <Select placeholder="选择项目类型">
                <Option value="商业综合体">商业综合体</Option>
                <Option value="办公建筑">办公建筑</Option>
                <Option value="创新中心">创新中心</Option>
                <Option value="金融中心">金融中心</Option>
                <Option value="海滨大厦">海滨大厦</Option>
                <Option value="城市广场">城市广场</Option>
                <Option value="商业区">商业区</Option>
                <Option value="海湾花园">海湾花园</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="项目货币"
              name="currency"
              rules={[{ required: true, message: '请选择货币类型' }]}
            >
              <Select placeholder="选择货币">
                <Option value="CNY">人民币 (CNY)</Option>
                <Option value="USD">美元 (USD)</Option>
                <Option value="AUD">澳元 (AUD)</Option>
                <Option value="EUR">欧元 (EUR)</Option>
                <Option value="GBP">英镑 (GBP)</Option>
                <Option value="CAD">加元 (CAD)</Option>
                <Option value="SGD">新加坡元 (SGD)</Option>
                <Option value="AED">迪拉姆 (AED)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="项目预算"
              name="budget"
              rules={[{ required: true, message: '请输入项目预算' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入预算金额"
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="汇率"
              name="exchangeRate"
              rules={[{ required: true, message: '请输入汇率' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="汇率"
                min={0}
                step={0.01}
                precision={4}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="项目状态"
              name="status"
              rules={[{ required: true, message: '请选择项目状态' }]}
            >
              <Select placeholder="选择项目状态">
                <Option value="reporting">报备中</Option>
                <Option value="modeling">建模</Option>
                <Option value="rendering">渲染</Option>
                <Option value="delivering">出图</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="付款状态"
              name="paymentStatus"
              rules={[{ required: true, message: '请选择付款状态' }]}
            >
              <Select placeholder="选择付款状态">
                <Option value="unpaid">未付款</Option>
                <Option value="partial">部分付款</Option>
                <Option value="completed">已付款</Option>
                <Option value="overdue">逾期</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="项目进度(%)"
              name="progress"
              rules={[{ required: true, message: '请输入项目进度' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="进度百分比"
                min={0}
                max={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="项目供应商"
              name="supplier"
              rules={[{ required: true, message: '请选择供应商' }]}
            >
              <Select placeholder="选择供应商">
                <Option value="supplier1">内部团队</Option>
                <Option value="supplier2">外包合作商A</Option>
                <Option value="supplier3">外包合作商B</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="项目截止日期"
              name="deadline"
              rules={[{ required: true, message: '请选择截止日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="项目描述" name="description">
          <TextArea rows={4} placeholder="请输入项目描述..." />
        </Form.Item>

        <Form.Item>
          <Checkbox>提供发票</Checkbox>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ProjectBasicInfoForm 
import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  message,
  Tabs,
  Space,
  Typography,
  Switch,
} from 'antd'
import {
  DollarOutlined,
  EuroOutlined,
  BankOutlined,
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

// 导入类型定义
import { ExchangeRate, SystemSettings as SystemSettingsType } from '../types/project'

// 导入组件
import ExchangeRateForm from '../components/settings/ExchangeRateForm'
import ExchangeRateTable from '../components/settings/ExchangeRateTable'
import SystemConfigPanel from '../components/settings/SystemConfigPanel'

const { Title, Text } = Typography

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false)

  // 默认汇率数据（相对于人民币CNY）
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    // 主要货币
    { currency: '美元', currencyCode: 'USD', currencySymbol: '$', rate: 7.24, region: '美国', flag: '🇺🇸' },
    { currency: '澳大利亚元', currencyCode: 'AUD', currencySymbol: 'A$', rate: 4.78, region: '澳大利亚', flag: '🇦🇺' },
    { currency: '欧元', currencyCode: 'EUR', currencySymbol: '€', rate: 7.85, region: '欧盟', flag: '🇪🇺' },
    { currency: '英镑', currencyCode: 'GBP', currencySymbol: '£', rate: 9.12, region: '英国', flag: '🇬🇧' },
    { currency: '加拿大元', currencyCode: 'CAD', currencySymbol: 'C$', rate: 5.31, region: '加拿大', flag: '🇨🇦' },
    { currency: '新西兰元', currencyCode: 'NZD', currencySymbol: 'NZ$', rate: 4.42, region: '新西兰', flag: '🇳🇿' },
    
    // 中东地区货币
    { currency: '阿联酋迪拉姆', currencyCode: 'AED', currencySymbol: 'AED', rate: 1.97, region: '阿联酋', flag: '🇦🇪' },
    { currency: '沙特里亚尔', currencyCode: 'SAR', currencySymbol: 'SR', rate: 1.93, region: '沙特阿拉伯', flag: '🇸🇦' },
    { currency: '卡塔尔里亚尔', currencyCode: 'QAR', currencySymbol: 'QR', rate: 1.99, region: '卡塔尔', flag: '🇶🇦' },
    { currency: '科威特第纳尔', currencyCode: 'KWD', currencySymbol: 'KD', rate: 23.56, region: '科威特', flag: '🇰🇼' },
    { currency: '巴林第纳尔', currencyCode: 'BHD', currencySymbol: 'BD', rate: 19.18, region: '巴林', flag: '🇧🇭' },
    { currency: '阿曼里亚尔', currencyCode: 'OMR', currencySymbol: 'OMR', rate: 18.81, region: '阿曼', flag: '🇴🇲' },
    { currency: '约旦第纳尔', currencyCode: 'JOD', currencySymbol: 'JD', rate: 10.22, region: '约旦', flag: '🇯🇴' },
    { currency: '黎巴嫩镑', currencyCode: 'LBP', currencySymbol: 'LBP', rate: 0.0048, region: '黎巴嫩', flag: '🇱🇧' },
    { currency: '土耳其里拉', currencyCode: 'TRY', currencySymbol: '₺', rate: 0.24, region: '土耳其', flag: '🇹🇷' },
    
    // 亚洲主要货币
    { currency: '日元', currencyCode: 'JPY', currencySymbol: '¥', rate: 0.048, region: '日本', flag: '🇯🇵' },
    { currency: '韩元', currencyCode: 'KRW', currencySymbol: '₩', rate: 0.0055, region: '韩国', flag: '🇰🇷' },
    { currency: '新加坡元', currencyCode: 'SGD', currencySymbol: 'S$', rate: 5.36, region: '新加坡', flag: '🇸🇬' },
    { currency: '港币', currencyCode: 'HKD', currencySymbol: 'HK$', rate: 0.93, region: '香港', flag: '🇭🇰' },
    { currency: '台币', currencyCode: 'TWD', currencySymbol: 'NT$', rate: 0.23, region: '台湾', flag: '🇹🇼' },
  ])

  // 保存设置
  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      // 更新汇率数据
      const updatedRates = exchangeRates.map(rate => ({
        ...rate,
        rate: values[rate.currencyCode] || rate.rate,
        lastUpdated: new Date().toISOString()
      }))
      
      setExchangeRates(updatedRates)
      
      // 保存到本地存储
      const settings: SystemSettingsType = {
        exchangeRates: updatedRates,
        autoUpdate: autoUpdateEnabled,
        baseCurrency: 'CNY',
        lastSyncTime: new Date().toISOString()
      }
      localStorage.setItem('systemSettings', JSON.stringify(settings))
      
      message.success('汇率设置保存成功！')
    } catch (error) {
      message.error('保存失败，请检查输入格式')
    } finally {
      setLoading(false)
    }
  }

  // 重置到默认值
  const handleReset = () => {
    form.resetFields()
    message.info('已重置为默认汇率')
  }

  // 从API获取最新汇率（模拟）
  const handleSyncRates = async () => {
    try {
      setLoading(true)
      message.loading('正在同步最新汇率...', 2)
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟汇率波动（±5%）
      const updatedRates = exchangeRates.map(rate => ({
        ...rate,
        rate: Number((rate.rate * (0.95 + Math.random() * 0.1)).toFixed(4)),
        lastUpdated: new Date().toISOString()
      }))
      
      setExchangeRates(updatedRates)
      
      // 更新表单值
      const formValues: any = {}
      updatedRates.forEach(rate => {
        formValues[rate.currencyCode] = rate.rate
      })
      form.setFieldsValue(formValues)
      
      message.success('汇率同步成功！')
    } catch (error) {
      message.error('汇率同步失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始化表单数据
  useEffect(() => {
    // 从本地存储加载设置
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      try {
        const settings: SystemSettingsType = JSON.parse(savedSettings)
        setExchangeRates(settings.exchangeRates)
        setAutoUpdateEnabled(settings.autoUpdate)
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }

    // 设置初始表单值
    const initialValues: any = {}
    exchangeRates.forEach(rate => {
      initialValues[rate.currencyCode] = rate.rate
    })
    form.setFieldsValue(initialValues)
  }, [])

  const tabItems = [
    {
      key: 'exchange',
      label: (
        <span>
          <DollarOutlined />
          汇率管理
        </span>
      ),
      children: (
        <Row gutter={24}>
          {/* 汇率设置表单 */}
          <Col span={14}>
            <Card 
              title={
                <Space>
                  <BankOutlined />
                  汇率设置
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    ghost 
                    icon={<ReloadOutlined />}
                    onClick={handleSyncRates}
                    loading={loading}
                  >
                    同步最新汇率
                  </Button>
                  <Button 
                    icon={<SaveOutlined />}
                    onClick={handleReset}
                  >
                    重置
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={loading}
                  >
                    保存设置
                  </Button>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <ExchangeRateForm
                form={form}
                exchangeRates={exchangeRates}
              />
            </Card>
          </Col>

          {/* 汇率监控面板 */}
          <Col span={10}>
            <Card 
              title={
                <Space>
                  <EuroOutlined />
                  汇率监控
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <ExchangeRateTable exchangeRates={exchangeRates} />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'system',
      label: (
        <span>
          <GlobalOutlined />
          系统配置
        </span>
      ),
      children: <SystemConfigPanel />
    }
  ]

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面头部 */}
      <div style={{ 
        background: '#fff', 
        padding: '16px 24px', 
        borderRadius: 8, 
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <GlobalOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              系统设置
            </Title>
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              配置汇率、系统参数等全局设置
            </Text>
          </div>
          <Space>
            <Switch
              checked={autoUpdateEnabled}
              onChange={setAutoUpdateEnabled}
              checkedChildren="自动更新"
              unCheckedChildren="手动更新"
            />
          </Space>
        </div>
      </div>

      <Tabs 
        defaultActiveKey="exchange" 
        size="large"
        items={tabItems}
      />
    </div>
  )
}

export default SystemSettings 
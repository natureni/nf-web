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
  Alert,
  Divider,
  Modal,
  InputNumber,
} from 'antd'
import {
  DollarOutlined,
  EuroOutlined,
  BankOutlined,
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  SettingOutlined,
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
  const [fixedRateForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false)
  const [fixedRateMode, setFixedRateMode] = useState(false)
  const [fixedRateModalVisible, setFixedRateModalVisible] = useState(false)

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

  // 固定汇率数据
  const [fixedExchangeRates, setFixedExchangeRates] = useState<ExchangeRate[]>([])

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
        fixedExchangeRates: fixedExchangeRates,
        autoUpdate: autoUpdateEnabled,
        fixedRateMode: fixedRateMode,
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

  // 保存固定汇率设置
  const handleSaveFixedRates = async () => {
    try {
      const values = await fixedRateForm.validateFields()
      
      // 更新固定汇率数据
      const updatedFixedRates = exchangeRates.map(rate => ({
        ...rate,
        rate: values[rate.currencyCode] || rate.rate,
        lastUpdated: new Date().toISOString()
      }))
      
      setFixedExchangeRates(updatedFixedRates)
      
      // 保存到本地存储
      const settings: SystemSettingsType = {
        exchangeRates: exchangeRates,
        fixedExchangeRates: updatedFixedRates,
        autoUpdate: autoUpdateEnabled,
        fixedRateMode: fixedRateMode,
        baseCurrency: 'CNY',
        lastSyncTime: new Date().toISOString()
      }
      localStorage.setItem('systemSettings', JSON.stringify(settings))
      
      setFixedRateModalVisible(false)
      message.success('固定汇率设置保存成功！')
    } catch (error) {
      message.error('保存失败，请检查输入格式')
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

  // 切换固定汇率模式
  const handleToggleFixedRateMode = (checked: boolean) => {
    setFixedRateMode(checked)
    
    if (checked && fixedExchangeRates.length === 0) {
      // 如果开启固定汇率模式但还没有设置固定汇率，使用当前汇率作为初始值
      setFixedExchangeRates([...exchangeRates])
      
      // 设置固定汇率表单的初始值
      const initialValues: any = {}
      exchangeRates.forEach(rate => {
        initialValues[rate.currencyCode] = rate.rate
      })
      fixedRateForm.setFieldsValue(initialValues)
    }
    
    message.info(checked ? '已启用固定汇率模式' : '已切换到实时汇率模式')
  }

  // 打开固定汇率设置弹窗
  const handleOpenFixedRateModal = () => {
    // 设置表单初始值
    const initialValues: any = {}
    const ratesToUse = fixedExchangeRates.length > 0 ? fixedExchangeRates : exchangeRates
    ratesToUse.forEach(rate => {
      initialValues[rate.currencyCode] = rate.rate
    })
    fixedRateForm.setFieldsValue(initialValues)
    
    setFixedRateModalVisible(true)
  }

  // 初始化表单数据
  useEffect(() => {
    // 从本地存储加载设置
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      try {
        const settings: SystemSettingsType = JSON.parse(savedSettings)
        setExchangeRates(settings.exchangeRates)
        setFixedExchangeRates(settings.fixedExchangeRates || [])
        setAutoUpdateEnabled(settings.autoUpdate)
        setFixedRateMode(settings.fixedRateMode || false)
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

  // 获取当前使用的汇率（固定汇率或实时汇率）
  const getCurrentRates = () => {
    return fixedRateMode && fixedExchangeRates.length > 0 ? fixedExchangeRates : exchangeRates
  }

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
                  实时汇率设置
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
                    disabled={fixedRateMode}
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
              {fixedRateMode && (
                <Alert
                  message="当前使用固定汇率模式"
                  description="项目管理将使用您设定的固定汇率进行计算。实时汇率仅供参考。"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              
              <ExchangeRateForm
                form={form}
                exchangeRates={exchangeRates}
                disabled={fixedRateMode}
              />
            </Card>

            {/* 固定汇率设置卡片 */}
            <Card 
              title={
                <Space>
                  <LockOutlined />
                  固定汇率模式
                </Space>
              }
              extra={
                <Space>
                  <Switch
                    checked={fixedRateMode}
                    onChange={handleToggleFixedRateMode}
                    checkedChildren={<LockOutlined />}
                    unCheckedChildren={<UnlockOutlined />}
                  />
                  <Button 
                    type="primary" 
                    ghost
                    icon={<SettingOutlined />}
                    onClick={handleOpenFixedRateModal}
                    disabled={!fixedRateMode}
                  >
                    设置固定汇率
                  </Button>
                </Space>
              }
            >
              <Alert
                message="固定汇率模式说明"
                description={
                  <div>
                    <p>• <strong>实时汇率模式</strong>：项目管理使用当前设置的实时汇率进行计算</p>
                    <p>• <strong>固定汇率模式</strong>：项目管理使用您预设的固定汇率，不受实时汇率变动影响</p>
                    <p>• 固定汇率适用于需要稳定预算计算的长期项目</p>
                  </div>
                }
                type="info"
                showIcon
              />
              
              {fixedRateMode && fixedExchangeRates.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Divider orientation="left">当前固定汇率</Divider>
                  <Row gutter={[16, 8]}>
                    {fixedExchangeRates.slice(0, 6).map(rate => (
                      <Col span={8} key={rate.currencyCode}>
                        <div style={{ 
                          padding: '8px 12px', 
                          background: '#f6ffed', 
                          border: '1px solid #b7eb8f', 
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          <div style={{ fontWeight: 500 }}>
                            {rate.flag} {rate.currencyCode}
                          </div>
                          <div style={{ color: '#52c41a' }}>
                            {rate.currencySymbol} 1 = ¥ {rate.rate.toFixed(4)}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card>
          </Col>

          {/* 汇率监控面板 */}
          <Col span={10}>
            <Card 
              title={
                <Space>
                  <EuroOutlined />
                  汇率监控
                  {fixedRateMode && (
                    <span style={{ fontSize: '12px', color: '#fa8c16' }}>
                      (显示固定汇率)
                    </span>
                  )}
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <ExchangeRateTable exchangeRates={getCurrentRates()} />
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

      {/* 固定汇率设置弹窗 */}
      <Modal
        title={
          <Space>
            <LockOutlined />
            设置固定汇率
          </Space>
        }
        open={fixedRateModalVisible}
        onCancel={() => setFixedRateModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setFixedRateModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveFixedRates}>
            保存固定汇率
          </Button>,
        ]}
      >
        <Alert
          message="设置固定汇率"
          description="设置后，项目管理中的汇率计算将使用这些固定值，不受实时汇率变动影响。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <ExchangeRateForm
          form={fixedRateForm}
          exchangeRates={exchangeRates}
        />
      </Modal>
    </div>
  )
}

export default SystemSettings 
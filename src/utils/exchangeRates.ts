import { ExchangeRate } from '../types/project'

// 系统设置接口
export interface SystemSettings {
  exchangeRates: ExchangeRate[]
  autoUpdate: boolean
  baseCurrency: string
  lastSyncTime?: string
  fixedRateMode: boolean
}

// 默认汇率数据
export const DEFAULT_EXCHANGE_RATES: ExchangeRate[] = [
  // 主要货币 - 按优先级排序：美元、人民币、澳元
  { currency: '美元', currencyCode: 'USD', currencySymbol: '$', rate: 7.24, region: '美国', flag: '🇺🇸' },
  { currency: '人民币', currencyCode: 'CNY', currencySymbol: '¥', rate: 1.00, region: '中国', flag: '🇨🇳' },
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
]

// 获取系统设置
export const getSystemSettings = (): SystemSettings => {
  const savedSettings = localStorage.getItem('systemSettings')
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings)
    } catch (error) {
      console.error('加载系统设置失败:', error)
    }
  }
  
  // 返回默认设置
  return {
    exchangeRates: DEFAULT_EXCHANGE_RATES,
    autoUpdate: false,
    baseCurrency: 'CNY',
    fixedRateMode: false
  }
}

// 保存系统设置
export const saveSystemSettings = (settings: SystemSettings): void => {
  localStorage.setItem('systemSettings', JSON.stringify(settings))
}

// 获取当前汇率
export const getCurrentExchangeRates = (): ExchangeRate[] => {
  const settings = getSystemSettings()
  return settings.exchangeRates
}

// 获取特定货币的汇率
export const getExchangeRate = (currencyCode: string): ExchangeRate | undefined => {
  const rates = getCurrentExchangeRates()
  return rates.find(rate => rate.currencyCode === currencyCode)
}

// 货币转换：从源货币转换为目标货币
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'CNY'
): number => {
  if (fromCurrency === toCurrency) {
    return amount
  }
  
  const rates = getCurrentExchangeRates()
  const fromRate = rates.find(rate => rate.currencyCode === fromCurrency)
  const toRate = rates.find(rate => rate.currencyCode === toCurrency)
  
  if (!fromRate || !toRate) {
    console.warn(`汇率不存在: ${fromCurrency} 或 ${toCurrency}`)
    return amount
  }
  
  // 先转换为人民币，再转换为目标货币
  const cnyAmount = amount * fromRate.rate
  return cnyAmount / toRate.rate
}

// 格式化货币显示
export const formatCurrency = (
  amount: number,
  currencyCode: string,
  options: {
    showSymbol?: boolean
    precision?: number
    showCode?: boolean
  } = {}
): string => {
  const { showSymbol = true, precision = 2, showCode = false } = options
  const rate = getExchangeRate(currencyCode)
  
  if (!rate) {
    return amount.toFixed(precision)
  }
  
  const parts = []
  
  if (showSymbol) {
    parts.push(rate.currencySymbol)
  }
  
  parts.push(amount.toLocaleString('zh-CN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }))
  
  if (showCode) {
    parts.push(rate.currencyCode)
  }
  
  return parts.join(' ')
}

// 检查是否为固定汇率模式
export const isFixedRateMode = (): boolean => {
  const settings = getSystemSettings()
  return settings.fixedRateMode || false
}

// 更新汇率（仅在非固定汇率模式下）
export const updateExchangeRates = (newRates: ExchangeRate[]): boolean => {
  if (isFixedRateMode()) {
    console.warn('固定汇率模式下无法更新汇率')
    return false
  }
  
  const settings = getSystemSettings()
  const updatedSettings: SystemSettings = {
    ...settings,
    exchangeRates: newRates,
    lastSyncTime: new Date().toISOString()
  }
  
  saveSystemSettings(updatedSettings)
  return true
}

// 设置固定汇率模式
export const setFixedRateMode = (enabled: boolean): void => {
  const settings = getSystemSettings()
  const updatedSettings: SystemSettings = {
    ...settings,
    fixedRateMode: enabled
  }
  
  saveSystemSettings(updatedSettings)
}

// 获取汇率历史记录（模拟功能）
export const getExchangeRateHistory = (currencyCode: string, days: number = 30): any[] => {
  // 这里可以实现真实的历史数据获取逻辑
  // 现在返回模拟数据
  const currentRate = getExchangeRate(currencyCode)
  if (!currentRate) return []
  
  const history = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // 模拟汇率波动
    const variation = (Math.random() - 0.5) * 0.1 // ±5%
    const rate = currentRate.rate * (1 + variation)
    
    history.push({
      date: date.toISOString().split('T')[0],
      rate: Number(rate.toFixed(4)),
      change: variation * 100
    })
  }
  
  return history
} 
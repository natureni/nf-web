// 汇率相关的工具函数
import { ExchangeRate, SystemSettings } from '../types/project'

// 汇率API配置
const EXCHANGE_RATE_API_CONFIG = {
  // 使用免费的 exchangerate-api.com 服务
  PRIMARY_API: {
    BASE_URL: 'https://api.exchangerate-api.com/v4/latest',
    FREE_TIER: true,
    RATE_LIMIT: '1500 requests per month'
  },
  // 备用API服务
  FALLBACK_API: {
    BASE_URL: 'https://api.freeforexapi.com/latest',
    FREE_TIER: true,
    RATE_LIMIT: 'unlimited'
  }
}

// 默认汇率设置
const defaultExchangeRates: ExchangeRate[] = [
  { currency: '人民币', currencyCode: 'CNY', currencySymbol: '¥', rate: 1.00, region: '中国', flag: '🇨🇳' },
  { currency: '美元', currencyCode: 'USD', currencySymbol: '$', rate: 7.2345, region: '美国', flag: '🇺🇸' },
  { currency: '欧元', currencyCode: 'EUR', currencySymbol: '€', rate: 7.8901, region: '欧盟', flag: '🇪🇺' },
  { currency: '英镑', currencyCode: 'GBP', currencySymbol: '£', rate: 9.1234, region: '英国', flag: '🇬🇧' },
  { currency: '日元', currencyCode: 'JPY', currencySymbol: '¥', rate: 0.0498, region: '日本', flag: '🇯🇵' },
  { currency: '韩元', currencyCode: 'KRW', currencySymbol: '₩', rate: 0.0055, region: '韩国', flag: '🇰🇷' },
  { currency: '港币', currencyCode: 'HKD', currencySymbol: 'HK$', rate: 0.9234, region: '香港', flag: '🇭🇰' },
  { currency: '澳元', currencyCode: 'AUD', currencySymbol: 'A$', rate: 4.8765, region: '澳大利亚', flag: '🇦🇺' },
  { currency: '加元', currencyCode: 'CAD', currencySymbol: 'C$', rate: 5.3456, region: '加拿大', flag: '🇨🇦' },
  { currency: '瑞士法郎', currencyCode: 'CHF', currencySymbol: 'CHF', rate: 8.1234, region: '瑞士', flag: '🇨🇭' },
  { currency: '新加坡元', currencyCode: 'SGD', currencySymbol: 'S$', rate: 5.36, region: '新加坡', flag: '🇸🇬' },
  { currency: '新西兰元', currencyCode: 'NZD', currencySymbol: 'NZ$', rate: 4.42, region: '新西兰', flag: '🇳🇿' },
  { currency: '阿联酋迪拉姆', currencyCode: 'AED', currencySymbol: 'AED', rate: 1.97, region: '阿联酋', flag: '🇦🇪' },
  { currency: '沙特里亚尔', currencyCode: 'SAR', currencySymbol: 'SR', rate: 1.93, region: '沙特阿拉伯', flag: '🇸🇦' },
  { currency: '卡塔尔里亚尔', currencyCode: 'QAR', currencySymbol: 'QR', rate: 1.99, region: '卡塔尔', flag: '🇶🇦' },
  { currency: '科威特第纳尔', currencyCode: 'KWD', currencySymbol: 'KD', rate: 23.56, region: '科威特', flag: '🇰🇼' },
  { currency: '巴林第纳尔', currencyCode: 'BHD', currencySymbol: 'BD', rate: 19.18, region: '巴林', flag: '🇧🇭' },
  { currency: '阿曼里亚尔', currencyCode: 'OMR', currencySymbol: 'OMR', rate: 18.81, region: '阿曼', flag: '🇴🇲' },
  { currency: '约旦第纳尔', currencyCode: 'JOD', currencySymbol: 'JD', rate: 10.22, region: '约旦', flag: '🇯🇴' },
  { currency: '黎巴嫩镑', currencyCode: 'LBP', currencySymbol: 'LBP', rate: 0.0048, region: '黎巴嫩', flag: '🇱🇧' },
  { currency: '土耳其里拉', currencyCode: 'TRY', currencySymbol: '₺', rate: 0.24, region: '土耳其', flag: '🇹🇷' },
  { currency: '台币', currencyCode: 'TWD', currencySymbol: 'NT$', rate: 0.23, region: '台湾', flag: '🇹🇼' }
]

// 默认系统设置
const defaultSystemSettings: SystemSettings = {
  exchangeRates: defaultExchangeRates,
  fixedExchangeRates: [],
  autoUpdate: true,
  fixedRateMode: false,
  baseCurrency: 'CNY',
  lastSyncTime: new Date().toISOString()
}

/**
 * 从API获取实时汇率数据
 * @param baseCurrency 基础货币，默认为USD
 * @returns Promise<汇率数据>
 */
export const fetchRealTimeExchangeRates = async (baseCurrency: string = 'USD'): Promise<ExchangeRate[]> => {
  try {
    console.log('正在获取实时汇率数据...')
    
    // 尝试主要API
    let response = await fetch(`${EXCHANGE_RATE_API_CONFIG.PRIMARY_API.BASE_URL}/${baseCurrency}`)
    
    if (!response.ok) {
      console.warn('主要API失败，尝试备用API...')
      // 尝试备用API
      response = await fetch(`${EXCHANGE_RATE_API_CONFIG.FALLBACK_API.BASE_URL}?base=${baseCurrency}`)
    }
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API返回数据:', data)
    
    // 解析API响应数据
    const rates = data.rates || {}
    const timestamp = data.time_last_updated || data.date || new Date().toISOString()
    
    // 将API数据转换为我们的格式
    const updatedRates: ExchangeRate[] = defaultExchangeRates.map(defaultRate => {
      let rate = defaultRate.rate // 使用默认值作为fallback
      
      if (baseCurrency === 'USD') {
        // 如果基础货币是USD，需要转换为相对于CNY的汇率
        if (defaultRate.currencyCode === 'CNY') {
          // CNY是我们的基础货币，汇率应该始终为1.0
          rate = 1.0
        } else if (defaultRate.currencyCode === 'USD') {
          // USD相对于CNY的汇率是USD对CNY汇率的倒数
          const usdToCny = rates.CNY || 7.2
          rate = 1 / usdToCny
        } else {
          // 其他货币：先转换为CNY
          const usdToCny = rates.CNY || 7.2
          const usdToTarget = rates[defaultRate.currencyCode]
          if (usdToTarget) {
            rate = usdToCny / usdToTarget // 计算相对于CNY的汇率
          }
        }
      }
      
      return {
        ...defaultRate,
        rate: Number(rate.toFixed(4)),
        lastUpdated: timestamp
      }
    })
    
    console.log('转换后的汇率数据:', updatedRates)
    return updatedRates
    
  } catch (error) {
    console.error('获取实时汇率失败:', error)
    
    // 返回带有错误标记的默认汇率
    return defaultExchangeRates.map(rate => ({
      ...rate,
      lastUpdated: new Date().toISOString(),
      error: '获取实时汇率失败，使用默认汇率'
    }))
  }
}

/**
 * 从多个API源获取汇率（提高可靠性）
 */
export const fetchExchangeRatesFromMultipleSources = async (): Promise<ExchangeRate[]> => {
  const sources = [
    // 源1：以USD为基础
    () => fetchRealTimeExchangeRates('USD'),
    // 源2：以EUR为基础（备用）
    () => fetchRealTimeExchangeRates('EUR'),
  ]
  
  for (const source of sources) {
    try {
      const rates = await source()
      // 检查是否有有效的汇率数据
      if (rates.some(rate => rate.lastUpdated && !rate.error)) {
        return rates
      }
    } catch (error) {
      console.warn('汇率源失败，尝试下一个源:', error)
    }
  }
  
  // 所有源都失败，返回默认汇率
  console.warn('所有汇率源都失败，使用默认汇率')
  return defaultExchangeRates
}

/**
 * 自动同步实时汇率
 */
export const syncRealTimeExchangeRates = async (): Promise<{ success: boolean; rates?: ExchangeRate[]; error?: string }> => {
  try {
    const realTimeRates = await fetchExchangeRatesFromMultipleSources()
    
    // 获取当前设置
    const settings = getSystemSettings()
    
    // 更新实时汇率
    const updatedSettings: SystemSettings = {
      ...settings,
      exchangeRates: realTimeRates,
      lastSyncTime: new Date().toISOString()
    }
    
    // 保存到localStorage
    saveSystemSettings(updatedSettings)
    
    console.log('实时汇率同步成功')
    return { success: true, rates: realTimeRates }
    
  } catch (error) {
    console.error('同步实时汇率失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }
  }
}

/**
 * 检查汇率数据是否需要更新
 * @param maxAgeMinutes 最大允许的数据年龄（分钟）
 */
export const shouldUpdateExchangeRates = (maxAgeMinutes: number = 60): boolean => {
  const settings = getSystemSettings()
  
  if (!settings.lastSyncTime) {
    return true // 从未同步过
  }
  
  const lastSync = new Date(settings.lastSyncTime)
  const now = new Date()
  const ageMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60)
  
  return ageMinutes > maxAgeMinutes
}

/**
 * 自动检查并更新汇率（如果需要）
 */
export const autoUpdateExchangeRatesIfNeeded = async (): Promise<void> => {
  const settings = getSystemSettings()
  
  // 只有在启用自动更新且不是固定汇率模式时才自动更新
  if (settings.autoUpdate && !settings.fixedRateMode && shouldUpdateExchangeRates()) {
    console.log('检测到汇率数据过期，自动更新中...')
    await syncRealTimeExchangeRates()
  }
}

/**
 * 保存系统设置到localStorage
 * @param settings 系统设置对象
 */
export const saveSystemSettings = (settings: SystemSettings): void => {
  try {
    localStorage.setItem('systemSettings', JSON.stringify(settings))
    console.log('系统设置保存成功:', settings)
  } catch (error) {
    console.error('保存系统设置失败:', error)
    throw error
  }
}

/**
 * 从localStorage获取系统设置
 * @returns 系统设置对象
 */
export const getSystemSettings = (): SystemSettings => {
  try {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      // 确保包含所有必需的字段
      return {
        ...defaultSystemSettings,
        ...parsed,
        exchangeRates: parsed.exchangeRates || defaultExchangeRates,
        fixedExchangeRates: parsed.fixedExchangeRates || []
      }
    }
    return defaultSystemSettings
  } catch (error) {
    console.error('获取系统设置失败:', error)
    return defaultSystemSettings
  }
}

/**
 * 获取当前汇率列表（实时汇率）
 * @returns 当前汇率数组
 */
export const getCurrentExchangeRates = (): ExchangeRate[] => {
  const settings = getSystemSettings()
  return settings.exchangeRates
}

/**
 * 获取固定汇率列表
 * @returns 固定汇率数组
 */
export const getFixedExchangeRates = (): ExchangeRate[] => {
  const settings = getSystemSettings()
  return settings.fixedExchangeRates || []
}

/**
 * 获取项目管理使用的汇率（根据模式返回固定汇率或实时汇率）
 * @returns 项目管理使用的汇率数组
 */
export const getProjectExchangeRates = (): ExchangeRate[] => {
  const settings = getSystemSettings()
  
  if (settings.fixedRateMode && settings.fixedExchangeRates && settings.fixedExchangeRates.length > 0) {
    return settings.fixedExchangeRates
  }
  
  return settings.exchangeRates
}

/**
 * 检查是否为固定汇率模式
 * @returns 是否为固定汇率模式
 */
export const isFixedRateMode = (): boolean => {
  const settings = getSystemSettings()
  return settings.fixedRateMode || false
}

/**
 * 获取汇率模式描述
 * @returns 汇率模式描述文本
 */
export const getRateModeDescription = (): string => {
  return isFixedRateMode() ? '固定汇率模式' : '实时汇率模式'
}

/**
 * 重置系统设置为默认值
 */
export const resetSystemSettings = (): SystemSettings => {
  saveSystemSettings(defaultSystemSettings)
  return defaultSystemSettings
}

/**
 * 更新特定货币的汇率
 * @param currencyCode 货币代码
 * @param newRate 新汇率
 */
export const updateExchangeRate = (currencyCode: string, newRate: number): void => {
  const settings = getSystemSettings()
  const rateIndex = settings.exchangeRates.findIndex(rate => rate.currencyCode === currencyCode)
  
  if (rateIndex !== -1) {
    settings.exchangeRates[rateIndex].rate = newRate
    settings.exchangeRates[rateIndex].lastUpdated = new Date().toISOString()
    saveSystemSettings(settings)
  }
}

/**
 * 获取特定货币的汇率（项目管理使用）
 * @param currencyCode 货币代码
 * @returns 汇率值，如果不存在则返回1
 */
export const getExchangeRate = (currencyCode: string): number => {
  const rates = getProjectExchangeRates()
  const rate = rates.find(rate => rate.currencyCode === currencyCode)
  return rate ? rate.rate : 1
}

/**
 * 获取特定货币的实时汇率
 * @param currencyCode 货币代码
 * @returns 实时汇率值，如果不存在则返回1
 */
export const getRealTimeExchangeRate = (currencyCode: string): number => {
  const rates = getCurrentExchangeRates()
  const rate = rates.find(rate => rate.currencyCode === currencyCode)
  return rate ? rate.rate : 1
}

/**
 * 获取特定货币的固定汇率
 * @param currencyCode 货币代码
 * @returns 固定汇率值，如果不存在则返回1
 */
export const getFixedExchangeRate = (currencyCode: string): number => {
  const rates = getFixedExchangeRates()
  const rate = rates.find(rate => rate.currencyCode === currencyCode)
  return rate ? rate.rate : 1
}

/**
 * 货币转换（使用项目管理汇率）
 * @param amount 金额
 * @param fromCurrency 源货币代码
 * @param toCurrency 目标货币代码
 * @returns 转换后的金额
 */
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = getExchangeRate(fromCurrency)
  const toRate = getExchangeRate(toCurrency)
  
  // 先转换为人民币，再转换为目标货币
  const cnyAmount = amount * fromRate
  return cnyAmount / toRate
}

/**
 * 货币转换（使用实时汇率）
 * @param amount 金额
 * @param fromCurrency 源货币代码
 * @param toCurrency 目标货币代码
 * @returns 转换后的金额
 */
export const convertCurrencyRealTime = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = getRealTimeExchangeRate(fromCurrency)
  const toRate = getRealTimeExchangeRate(toCurrency)
  
  // 先转换为人民币，再转换为目标货币
  const cnyAmount = amount * fromRate
  return cnyAmount / toRate
}

export type { ExchangeRate, SystemSettings } 
// 汇率相关的工具函数
import { ExchangeRate, SystemSettings } from '../types/project'

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
  { currency: '瑞士法郎', currencyCode: 'CHF', currencySymbol: 'CHF', rate: 8.1234, region: '瑞士', flag: '🇨🇭' }
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
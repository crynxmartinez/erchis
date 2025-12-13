import { VARIANT_CONFIG } from './types'

export const getVariantColor = (variantType: string) => {
  const config = VARIANT_CONFIG[variantType]
  return config?.color || 'bg-gray-900/50 border-gray-500 text-gray-300'
}

export const getVariantIcon = (variantType: string) => {
  const config = VARIANT_CONFIG[variantType]
  return config?.icon || '❓'
}

export const getStageColor = (stage: number) => {
  const colors = [
    'border-gray-500 text-gray-400',
    'border-green-500 text-green-400',
    'border-blue-500 text-blue-400',
    'border-purple-500 text-purple-400',
    'border-orange-500 text-orange-400',
    'border-red-500 text-red-400',
  ]
  return colors[stage] || colors[0]
}

import { BigNumber, ethers, utils } from 'ethers'
import numeral from 'numeral'

export const ETHEREUM_BLOCK_TIME = 13


export const formatUnits = (num: number | string, power?: number) =>
  power
    ? parseFloat(utils.formatUnits(num, power))
    : parseFloat(utils.formatUnits(num, 18))

export const formatUnitsOriginal = (num: number | string, power?: number) =>
  power ? utils.formatUnits(num, power) : utils.formatUnits(num, 18)

export const formatUnits2 = (num: number | string) => {
  let result = num.toString()
  try {
    const value = num ? utils.formatUnits(num, 18) : ''
    if (parseFloat(value) > -0.0005 && parseFloat(value) < 0.0005) {
      result = value
    } else {
      result = numeral(value).format('0,0.00')
    }
  } catch (e) {
    console.error(`Wrong big number ${e}`)
  }
  return result
}

export const roundDown = (num: number | string) =>
  Math.floor(formatUnits(num) * 10000) / 10000

export const toGRT = (num: number | string, format?: string) => {
  let parsed = 0
  parsed = num && parseFloat(utils.formatUnits(num, 18))
  const result =
    parsed === 0
      ? '0'
      : parsed > 0 && parsed < 0.5
      ? '~ 0'
      : numeral(parsed).format(format ? format : '0.0a')
  return result
}

export const formatWithNumeral = (num: number | string, format?: string) => {
  const result =
    num === 0
      ? '0'
      : num > 0 && num < 0.5
      ? '~ 0'
      : numeral(num).format(format ? format : '0.0a')
  return result
}

export const formatWithNumeralPrecise = (num: string, format?: string) => {
  if (num) {
    if (parseFloat(num) > 0 && parseFloat(num) < 0.5) {
      return num
    }
    return format ? numeral(num).format(format) : numeral(num).format('0,0.00')
  }
  return ''
}

export const toWei = (value: string, power?: number) =>
  power ? utils.parseUnits(value, power) : utils.parseUnits(value, 18)

export const formatToString = (value: string) => ethers.BigNumber.from(value).toString()

export const formatBalance = (balance: string) => utils.formatEther(balance)

export const formatNameHash = (value: string) => utils.namehash(`${value}.eth`)

export const bigNumberify = (value: any): BigNumber => {
  let result = value
  try {
    result = ethers.BigNumber.from(value)
  } catch (e) {
    console.error(`BigNumberify failed: ${e.message}`)
  }
  return result
}

export const decToBigNumber = (value: any) => {
  let result = '' as any
  try {
    const truncatedValue = Math.trunc(value)
    const stringValue = truncatedValue.toLocaleString('fullwide', { useGrouping: false })
    result = bigNumberify(stringValue)
  } catch (e) {
    console.error(`Unable to convert decimal to big number: ${e.message}`)
  }
  return result
}



import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
// AssemblyScript types
declare type i32 = number;

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

// Helper function for absolute value of BigDecimal since abs() is not available directly
export function absoluteValue(value: BigDecimal): BigDecimal {
  if (value.lt(ZERO_BD)) {
    return value.times(BigDecimal.fromString('-1'))
  }
  return value
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: number): BigDecimal {
  if (exchangeDecimals == 0) {
    return tokenAmount.toBigDecimal()
  }
  
  // Convert number to i32 using manual conversion
  const decimalsI32 = exchangeDecimals as i32;
  // Explicitly cast the i32 type when using it
  const exchangeDecimalsBI = BigInt.fromI32(decimalsI32);
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimalsBI))
}

export function calculateAverage(values: BigDecimal[], weights: BigDecimal[]): BigDecimal {
  let sum = ZERO_BD
  let weightSum = ZERO_BD
  
  for (let i = 0; i < values.length; i++) {
    sum = sum.plus(values[i].times(weights[i]))
    weightSum = weightSum.plus(weights[i])
  }
  
  if (weightSum.equals(ZERO_BD)) {
    return ZERO_BD
  }
  
  return sum.div(weightSum)
}

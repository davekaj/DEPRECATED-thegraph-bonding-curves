import Decimal from 'decimal.js'
import { BigNumber, ethers, utils } from 'ethers'
import { bigNumberify } from './helpers'

Decimal.set({ toExpPos: 28, rounding: Decimal.ROUND_DOWN })

const ZERO_D = new Decimal(0)
const ONE = new Decimal(1)
const MAX_WEIGHT = new Decimal(1000000)
const PPM = new Decimal(1000000)
const DECIMAL_E18 = new Decimal('1000000000000000000')
const ZERO_BN = BigNumber.from(0)

// Global contract value, non-upgradeable
const SIGNAL_PER_MINIMUM_DEPOSIT = DECIMAL_E18

/**
 * @dev Calculate nSignal to be returned for an amount of GRT.
 * @param _tokensCuratedOnDeployment Total tokens curated on the SubgraphDeployment
 * @param _reserveRatio Reserve ratio for the SubgraphDeployment (in PPM)
 * @param _totalVSignal Total vSignal of the SubgraphDeployment
 * @param _tokensIn The tokens the user wants to spend to mint nSignal
 * @param _curationTax The current curation tax of the network (a global state variable)
 * @param _minimumCurationDeposit Minimum curation deposit (a global state variable)
 * @param _totalNSignal Total nSignal of the Subgraph
 * @param _vSignalGNS Total vSignal owned by the GNS
 * @return Amount of nSignal that can be bought
 */
export function tokensToNSignal(
  _tokensCuratedOnDeployment: Decimal,
  _reserveRatio: Decimal,
  _totalVSignal: Decimal,
  _tokensIn: Decimal,
  _curationTax: Decimal,
  _minimumCurationDeposit: Decimal,
  _totalNSignal: Decimal,
  _vSignalGNS: Decimal,
): [BigNumber, BigNumber, BigNumber] {
  const [vSignal, curationTax] = tokensToSignal(
    _tokensCuratedOnDeployment,
    _reserveRatio,
    _totalVSignal,
    _tokensIn,
    _curationTax,
    _minimumCurationDeposit,
  )

  const nSignal = vSignalToNSignal(_totalNSignal, _vSignalGNS, vSignal)
  console.log('N SIGNAL: ', BigNumber.from(nSignal.toString()).toString())
  return [vSignal, nSignal, curationTax]
}

/**
 * @dev Calculate vSignal to be returned for an amount of GRT.
 * @param _tokensCuratedOnDeployment Total tokens curated on the SubgraphDeployment
 * @param _reserveRatio Reserve ratio for the SubgraphDeployment (in PPM)
 * @param _totalVSignal Total vSignal of the SubgraphDeployment
 * @param _tokensIn The tokens the user wants to spend to mint nSignal
 * @param _curationTax The current curation tax of the network (a global state variable)
 * @param _minimumCurationDeposit Minimum curation deposit (a global state variable)
 * @return Amount of vSignal that can be bought
 */
export function tokensToSignal(
  _tokensCuratedOnDeployment: Decimal,
  _reserveRatio: Decimal,
  _totalVSignal: Decimal,
  _tokensIn: Decimal,
  _curationTax: Decimal,
  _minimumCurationDeposit: Decimal,
): [BigNumber, BigNumber] {
  const tax: Decimal = _tokensIn.mul(_curationTax).div(PPM)
  let signalOut: Decimal

  const tokensMinusTax: Decimal = _tokensIn.sub(tax)
  if (_tokensCuratedOnDeployment == ZERO_D) {
    if (_tokensIn.lt(_minimumCurationDeposit)) {
      console.warn(
        'ERROR: Curation deposit is below minimum required. This contract call would fail on the EVM. We return [0,0] here',
      )
      return [ZERO_BN, ZERO_BN]
    }

    signalOut = purchaseTargetAmount(
      SIGNAL_PER_MINIMUM_DEPOSIT,
      _minimumCurationDeposit,
      _reserveRatio,
      tokensMinusTax.sub(_minimumCurationDeposit),
    )
  } else {
    signalOut = purchaseTargetAmount(
      _totalVSignal,
      _tokensCuratedOnDeployment,
      _reserveRatio,
      tokensMinusTax,
    )
  }

  console.log('TAX: ', BigNumber.from(tax.toString()).toString())
  console.log('signalOut: ', BigNumber.from(signalOut.toString()).toString())

  return [signalOut, tax]
}

/**
 * @dev Calculate nSignal to be returned for an amount of vSignal.
 * @param _totalNSignal Total nSignal
 * @param _vSignalGNS Total vSignal owned by the GNS
 * @param _vSignalIn Amount of vSignal to exchange for nSignal
 * @return Amount of nSignal that can be bought
 */
function vSignalToNSignal(
  _totalNSignal: Decimal,
  _vSignalGNS: Decimal,
  _vSignalIn: Decimal,
): BigNumber {
  // always can initalize at 1 to 1, and avoid division by zero
  if (_vSignalGNS == ZERO_D) {
    return _vSignalIn
  }
  // Here we simplify, and do NOT use bancor formula, because we know that the
  // nameReserveRatio should always be 1000000 (i.e. 1 in PPM)
  // The formula simplifies to _totalNSignal * _vSignalIn / _vSignalGNS
  return _totalNSignal.mul(_vSignalIn).div(_vSignalGNS)
}

////////////////////////////////// N SIGNAL TO TOKENS BELOW
////////////////////////////////// N SIGNAL TO TOKENS BELOW
////////////////////////////////// N SIGNAL TO TOKENS BELOW

/**
 * @dev Calculate GRT to be received for an amount of nSignal being burnt
 * @param _tokensCuratedOnDeployment Total tokens curated on the SubgraphDeployment
 * @param _reserveRatio Reserve ratio for the SubgraphDeployment (in PPM)
 * @param _totalVSignal Total vSignal of the SubgraphDeployment
 * @param _nSignalIn The nSignal the user wants to burn to receive GRT
 * @param _totalNSignal Total nSignal of the Subgraph
 * @param _vSignalGNS Total vSignal owned by the GNS
 * @return Amount of nSignal that can be bought
 */
export function nSignalToTokens(
  _tokensCuratedOnDeployment: Decimal,
  _reserveRatio: Decimal,
  _totalVSignal: Decimal,
  _nSignalIn: Decimal,
  _totalNSignal: Decimal,
  _vSignalGNS: Decimal,
): [BigNumber, BigNumber] {
  const vSignalOut = nSignalToVSignal(_totalNSignal, _vSignalGNS, _nSignalIn)
  const tokensOut = signalToTokens(
    _tokensCuratedOnDeployment,
    _reserveRatio,
    _totalVSignal,
    vSignalOut,
  )
  console.log('VSIG OUT: ', BigNumber.from(vSignalOut.toString()).toString())
  return [decimalToBN( vSignalOut), tokensOut]
}

/**
 * @dev Calculate nSignal to be returned for an amount of vSignal.
 * @param _totalNSignal Total nSignal of the Subgraph
 * @param _vSignalGNS Total vSignal owned by the GNS
 * @param _nSignalIn Amount of nSignal to exchange for vSignal
 * @return Amount of vSignal to be received
 */
function nSignalToVSignal(
  _totalNSignal: Decimal,
  _vSignalGNS: Decimal,
  _nSignalIn: Decimal,
): Decimal {
  // Here we simplify, and do NOT use bancor formula, because we know that the
  // nameReserveRatio should always be 1000000 (i.e. 1 in PPM)
  // The formula simplifies to _vSignalGNS * _nSignalIn / _totalNSignal
  return (_vSignalGNS.mul(_nSignalIn).div(_totalNSignal)
}

/**
 * @dev Calculate vSignal to be returned for an amount of GRT.
 * @param _tokensCuratedOnDeployment Total tokens curated on the SubgraphDeployment
 * @param _reserveRatio Reserve ratio for the SubgraphDeployment (in PPM)
 * @param _totalVSignal Total vSignal of the SubgraphDeployment
 * @param _vSignalIn The vSignal to burn for GRT
 * @return Amount of vSignal that can be bought
 */
export function signalToTokens(
  _tokensCuratedOnDeployment: Decimal,
  _reserveRatio: Decimal,
  _totalVSignal: Decimal,
  _vSignalIn: Decimal,
): BigNumber {
  if (_tokensCuratedOnDeployment.lte(ZERO_D)) {
    console.warn(
      'ERROR: Subgraph deployment must be curated to perform calculations. This would fail on the EVM. We return 0',
    )
    return ZERO_BN
  }
  if (_vSignalIn > _totalVSignal) {
    console.warn(
      'ERROR: Signal must be above or equal to signal issued in the curation pool. This would fail on the EVM. We return 0',
    )
    return ZERO_BN
  }

  const tokensOut = saleTargetAmount(
    _totalVSignal,
    _tokensCuratedOnDeployment,
    _reserveRatio,
    _vSignalIn,
  )
  console.log('TOKENS OUT: ', BigNumber.from(tokensOut.toString()).toString())
  return tokensOut
}

/**
 * @dev given a vSignal supply, GRT reserve balance, ratio and a deposit amount (in GRT),
 * calculates the return in vSignal (i.e minting). Only used for vSignal calculations.
 *
 * Formula:
 * Return = _supply * ((1 + _depositAmount / _reserveBalance) ^ (_reserveRatio / 1000000) - 1)
 *
 * @param supply              vSignal supply
 * @param reserveBalance      total GRT reserve balance
 * @param reserveRatio        reserve ratio, represented in ppm, (i.e. 1 == 1000000)
 * @param depositAmount       deposit amount, in GRT
 *
 * @return purchase return amount in vSignal
 */
function purchaseTargetAmount(
  supply: Decimal,
  reserveBalance: Decimal,
  reserveWeight: Decimal,
  depositAmount: Decimal,
): BigNumber {
  // special case for 0 deposit amount
  if (depositAmount.equals(ZERO_D)) return ZERO_BN

  // special case if the weight = 100%
  if (reserveWeight.equals(MAX_WEIGHT)) return decimalToBN(supply.mul(depositAmount).div(reserveBalance))

  // return supply * ((1 + amount / reserveBalance) ^ (reserveWeight / MAX_WEIGHT) - 1)
  return decimalToBN(supply.mul(
    ONE.add(depositAmount.div(reserveBalance)).pow(reserveWeight.div(MAX_WEIGHT)).sub(ONE),
  ))
}

/**
 * @dev given a vSignal supply, GRT reserve balance, ratio and a sellAmount (i.e. burn)
 * in vSignal, calculates the return in GRT. Only used for vSignal calculations.
 *
 * Formula:
 * Return = _reserveBalance * (1 - (1 - _sellAmount / _supply) ^ (1000000 / _reserveRatio))
 *
 * @param supply              token vSignal supply
 * @param reserveBalance      total GRT reserve balance
 * @param reserveRatio        reserve ratio, represented in ppm, 1 == 1000000
 * @param sellAmount          sell amount, in vSignal
 *
 * @return sale return amount in GRT
 */

function saleTargetAmount(
  supply: Decimal,
  reserveBalance: Decimal,
  reserveRatio: Decimal,
  sellAmount: Decimal,
): BigNumber {
  // special case for 0 sell amount
  if (sellAmount.equals(ZERO_D)) return ZERO_BN

  // special case for selling the entire supply
  if (sellAmount.equals(supply)) return decimalToBN(reserveBalance)

  // special case if the weight = 100%
  if (reserveRatio.equals(MAX_WEIGHT))
    return decimalToBN(reserveBalance.mul(sellAmount).div(supply))

  // return reserveBalance * (1 - (1 - amount / supply) ^ (MAX_WEIGHT / reserveWeight))
  return decimalToBN(
    reserveBalance.mul(ONE.sub(ONE.sub(sellAmount.div(supply)).pow(MAX_WEIGHT.div(reserveRatio)))),
  )
}

function decimalToBN(decimal: Decimal): BigNumber {
  return BigNumber.from(decimal.toString())
}

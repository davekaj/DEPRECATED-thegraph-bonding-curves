// import { bigNumberify } from "helpers";
import Decimal from 'decimal.js'
import { BigNumber, ethers, utils } from 'ethers'

import { nSignalToTokens, tokensToNSignal, signalToTokens, tokensToSignal } from './src/src'
import { exampleQueryResult } from './example-query'

const result = exampleQueryResult.data
const ONE_HUNDRED_THOUSAND_E18 = BigNumber.from('100000000000000000000000')
const ONE_HUNDRED_E18 = BigNumber.from('100000000000000000000')

Decimal.set({ toExpPos: 28, rounding: Decimal.ROUND_DOWN })

// TODO - grab a delegators address, so we could do BURN too, would need to read name signal

// EXAMPLE QUERY - GLOBAL VALUES
const CURATION_TAX = BigNumber.from(result.graphNetwork.curationTaxPercentage)
const MINIMUM_CURATION_DEPOSIT = BigNumber.from(
  result.graphNetwork.minimumCurationDeposit,
)

///// EXAMPLE QUERY - SUBGRAPH SPECIFIC VALUES
const SUBGRAPH_DEPLOYMENT = result.subgraph.currentVersion.subgraphDeployment
const tokensCuratedOnDeployment = BigNumber.from(SUBGRAPH_DEPLOYMENT.signalledTokens)
const totalVSignal = BigNumber.from(SUBGRAPH_DEPLOYMENT.signalAmount)
const reserveRatio = BigNumber.from(SUBGRAPH_DEPLOYMENT.reserveRatio)
const totalNSignal = BigNumber.from(result.subgraph.nameSignalAmount)
const vSignalGNS = BigNumber.from(result.signal.signal)
const userNSignal = BigNumber.from(result.nameSignal.nameSignal)

function prettyPrintBNs(bns: Array<BigNumber>): void {
  bns.forEach((element) => {
    console.log(element.toString())
  })
}

function main() {
  console.log('tokensToNSignal:')
  prettyPrintBNs(
    tokensToNSignal(
      tokensCuratedOnDeployment,
      reserveRatio,
      totalVSignal,
      ONE_HUNDRED_THOUSAND_E18,
      CURATION_TAX,
      MINIMUM_CURATION_DEPOSIT,
      totalNSignal,
      vSignalGNS,
    ),
  )
  console.log('tokensToSignal:')
  prettyPrintBNs(
    tokensToSignal(
      tokensCuratedOnDeployment,
      reserveRatio,
      totalVSignal,
      ONE_HUNDRED_THOUSAND_E18,
      CURATION_TAX,
      MINIMUM_CURATION_DEPOSIT,
    ),
  )
  console.log('nSignalToTokens:')
  prettyPrintBNs(
    nSignalToTokens(
      tokensCuratedOnDeployment,
      reserveRatio,
      totalVSignal,
      userNSignal,
      totalNSignal,
      vSignalGNS,
    ),
  )
  console.log('signalToTokens:')
}

main()

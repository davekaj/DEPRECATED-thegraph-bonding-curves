// import { Decimalify } from "helpers";
import Decimal from 'decimal.js'
import { BigNumber, ethers, utils } from 'ethers'

import { nSignalToTokens, tokensToNSignal, signalToTokens, tokensToSignal } from './src/src'
import { exampleQueryResult } from './example-query'

const ONE_HUNDRED_THOUSAND_E18 = new Decimal('100000000000000000000000')
const ONE_HUNDRED_E18 = new Decimal('100000000000000000000')

Decimal.set({ toExpPos: 28, rounding: Decimal.ROUND_DOWN })

// TODO - grab a delegators address, so we could do BURN too, would need to read name signal

// EXAMPLE QUERY - GLOBAL VALUES
const CURATION_TAX = new Decimal(exampleQueryResult.data.graphNetwork.curationTaxPercentage)
const MINIMUM_CURATION_DEPOSIT = new Decimal(
  exampleQueryResult.data.graphNetwork.minimumCurationDeposit,
)

///// EXAMPLE QUERY - SUBGRAPH SPECIFIC VALUES
const SUBGRAPH_DEPLOYMENT = exampleQueryResult.data.subgraph.currentVersion.subgraphDeployment
const tokensCuratedOnDeployment = new Decimal(SUBGRAPH_DEPLOYMENT.signalledTokens)
const totalVSignal = new Decimal(SUBGRAPH_DEPLOYMENT.signalAmount)
const reserveRatio = new Decimal(SUBGRAPH_DEPLOYMENT.reserveRatio)
const totalNSignal = new Decimal(exampleQueryResult.data.subgraph.nameSignalAmount)
const vSignalGNS = new Decimal(exampleQueryResult.data.signal.signal)
const userNSignal = new Decimal(exampleQueryResult.data.nameSignal.nameSignal)

// function prettyPrintBNs(bns: Array<Decimal>): void {
//   bns.forEach((element) => {
//     console.log(element.toString())
//   })
// }

function main() {
  console.log('tokensToNSignal:')
  console.log(
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
  console.log(
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
  console.log(
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
  console.log(
    signalToTokens(
      tokensCuratedOnDeployment,
      reserveRatio,
      totalVSignal,
      vSignalGNS,
    ),
  )
}

main()

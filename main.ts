// import { bigNumberify } from "helpers";
// import Decimal from 'decimal.js'
import { BigNumber, ethers, utils } from 'ethers'

import { nSignalToTokens, tokensToNSignal, signalToTokens, tokensToSignal } from './src/src'
import exampleQuery from './example-query.json'

const ONE_HUNDRED_THOUSAND_E18 = BigNumber.from('100000000000000000000000')
const ONE_HUNDRED_E18 = BigNumber.from('100000000000000000000')

// Decimal.set({ precision: 30, rounding: Decimal.ROUND_DOWN })

// TODO - grab a delegators address, so we could do BURN too, would need to read name signal

// EXAMPLE QUERY - GLOBAL VALUES
const CURATION_TAX = BigNumber.from(exampleQuery.data.graphNetwork.curationTaxPercentage)
const MINIMUM_CURATION_DEPOSIT = BigNumber.from(
  exampleQuery.data.graphNetwork.minimumCurationDeposit,
)

///// EXAMPLE QUERY - SUBGRAPH SPECIFIC VALUES
const SUBGRAPH_DEPLOYMENT = exampleQuery.data.subgraph.currentVersion.subgraphDeployment
const tokensCuratedOnDeployment = BigNumber.from(SUBGRAPH_DEPLOYMENT.signalledTokens)
const totalVSignal = BigNumber.from(SUBGRAPH_DEPLOYMENT.signalAmount)
const reserveRatio = SUBGRAPH_DEPLOYMENT.reserveRatio // no BigNumber
const totalNSignal = BigNumber.from(exampleQuery.data.subgraph.nameSignalAmount)
const vSignalGNS = BigNumber.from(exampleQuery.data.signal.signal)
const userNSignal = BigNumber.from(exampleQuery.data.nameSignal.nameSignal)

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

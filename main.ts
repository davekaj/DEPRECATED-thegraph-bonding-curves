// import { bigNumberify } from "helpers";
import Decimal from 'decimal.js'

import { nSignalToTokens, tokensToNSignal, signalToTokens, tokensToSignal } from './src/src'
import exampleQuery from './example-query.json'

const ONE_HUNDRED_THOUSAND_E18 = new Decimal('100000000000000000000000')
const ONE_HUNDRED_E18 = new Decimal('100000000000000000000')

Decimal.set({ precision: 30, rounding: Decimal.ROUND_DOWN })

// TODO - grab a delegators address, so we could do BURN too, would need to read name signal

// EXAMPLE QUERY - GLOBAL VALUES
const CURATION_TAX = new Decimal(exampleQuery.data.graphNetwork.curationTaxPercentage)
const MINIMUM_CURATION_DEPOSIT = new Decimal(exampleQuery.data.graphNetwork.minimumCurationDeposit)

///// EXAMPLE QUERY - SUBGRAPH SPECIFIC VALUES
const SUBGRAPH_DEPLOYMENT = exampleQuery.data.subgraph.currentVersion.subgraphDeployment
const tokensCuratedOnDeployment = new Decimal(SUBGRAPH_DEPLOYMENT.signalledTokens)
const totalVSignal = new Decimal(SUBGRAPH_DEPLOYMENT.signalAmount)
const reserveRatio = new Decimal(SUBGRAPH_DEPLOYMENT.reserveRatio)
const totalNSignal = new Decimal(exampleQuery.data.subgraph.nameSignalAmount)
const vSignalGNS = new Decimal(exampleQuery.data.signal.signal)
const userNSignal = new Decimal(exampleQuery.data.nameSignal.nameSignal)

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
}

main()

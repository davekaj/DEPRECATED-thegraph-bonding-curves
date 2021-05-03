export const exampleQuery = `
  {
    graphNetwork(id: "1") {
      curationTaxPercentage
      minimumCurationDeposit
    }
    nameSignal(id: "0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0") {
      nameSignal
    }
    signal(id: "0xadca0dd4729c8ba3acf3e99f3a9f471ef37b6825-0x31f6fb67c823a07a93bae6b022798eebdf86210033c0e97a1402795c0c2fa99b") {
      signal
    }
    subgraph(id: "0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0"){
      currentVersion {
        subgraphDeployment {
          reserveRatio
          signalAmount
          signalledTokens
        }
      }
      displayName
      id
      nameSignalAmount
    }
  }
`

export const exampleQueryResult = {
  data: {
    graphNetwork: {
      curationTaxPercentage: 25000,
      minimumCurationDeposit: '1000000000000000000',
    },
    nameSignal: {
      nameSignal: '156124949959959955146',
    },
    signal: {
      signal: '360104151600616787382',
    },
    subgraph: {
      currentVersion: {
        subgraphDeployment: {
          reserveRatio: 500000,
          signalAmount: '360104151600616787382',
          signalledTokens: '129674999999999997955277',
        },
      },
      displayName: 'Omen',
      id: '0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0',
      nameSignalAmount: '360104151600616787382',
    },
  },
}

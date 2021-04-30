# Bonding curves for The Graph Curation

Implements the Bancor Formula, and exposes it through the following functions:
- `tokensToNSignal()` - Used for current version subgraphs
- `nSignalToTokens()` - Used for current version subgraphs
- `tokenstoSignal()` - Used for signaling on old versions
- `signalToTokens()` - Used for signaling on old versions

These two functions mimic exactly the two functions that exist on the GNS contract for the graph
network.

## How to use
- I have provided a sample query, and the result of that query. This sample query is exactly
  what should be ran in the front end, and you should get query results that look very similar
  to the example result.
- Please just copy paste this code and fit it into the graph front end as needed. No need to make this a package or anything
- Only use the 4 exported functions `tokensToNSignal(), nSignalToTokens(), tokensToSignal(), signalToTokens()`. This is all that is needed in the front end



TODO
- getIndexerCapacity (staking)
- pending rewards (rewards manager)
- add tests by querying the subgraph, and, running real tests. should work on dynamic queries
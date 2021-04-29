// import { bigNumberify } from "helpers";
import Decimal from "decimal.js";
import exampleQuery from "./example-query.json";

const ZERO = new Decimal(0);
const ONE = new Decimal(1);
const MAX_WEIGHT = new Decimal(1000000);
const PPM = new Decimal(1000000);
const SIGNAL_PER_MINIMUM_DEPOSIT = new Decimal(1e18);
const ONE_HUNDRED_THOUSAND_E18 = new Decimal("100000000000000000000000");
const ONE_HUNDRED_E18 = new Decimal("100000000000000000000");

// TODO - grab a delegators address, so we could do BURN too, would need to read name signal
// TODO - incorpate the tax!?

const MINIMUM_CURATION_DEPOSIT = new Decimal(
  exampleQuery.data.graphNetwork.minimumCurationDeposit
);
const CURATION_TAX = new Decimal(
  exampleQuery.data.graphNetwork.curationTaxPercentage
);

// Name signal query data
const nameSignalAmount = new Decimal(
  exampleQuery.data.subgraph.nameSignalAmount
);

// Version signal query data
const tokensCuratedOnDeployment = new Decimal(
  exampleQuery.data.subgraph.currentVersion.subgraphDeployment.signalledTokens
);
const versionSignalAmount = new Decimal(
  exampleQuery.data.subgraph.currentVersion.subgraphDeployment.signalAmount
);
const versionReserveRatio = new Decimal(
  exampleQuery.data.subgraph.currentVersion.subgraphDeployment.reserveRatio
);

function getGNSvSignal(curatorSignals: Array<any>): Decimal {
  for (let i = 0; i < curatorSignals.length; i++) {
    if (
      curatorSignals[i].curator.id ==
      "0xadca0dd4729c8ba3acf3e99f3a9f471ef37b6825"
    ) {
      return curatorSignals[i].signal;
    }
  }
}

const vSignalGNS = getGNSvSignal(
  exampleQuery.data.subgraph.currentVersion.subgraphDeployment.curatorSignals
);

Decimal.set({ precision: 30, rounding: Decimal.ROUND_DOWN });

// export function toWei(amount, decimals) {
//   return new Decimal(`${amount}e+${decimals}`).toFixed();
// }

// export function fromWei(amount, decimals) {
//   return new Decimal(`${amount}e-${decimals}`).toFixed();
// }

// export function toDecimalPlaces(amount, decimals) {
//   return amount.toDecimalPlaces(decimals).toFixed();
// }

/**
 * @dev Calculate nSignal to be returned for an amount of vSignal.
 * @param _tokensCuratedOnDeployment Total tokens curated on the SubgraphDeployment
 * @param _reserveRatio Reserve ratio for the SubgraphDeployment (in PPM)
 * @param _minimumCurationDeposit Minimum curation deposit (a global state variable)
 * @param _totalVSignal Total vSignal of the SubgraphDeployment
 * @param _tokensIn The tokens the user wants to spend to mint nSignal
 * @param _totalNSignal Total nSignal of the Subgraph
 * @param _vSignalGNS Total vSignal owned by the GNS (i.e. the reserve token)
 * @return Amount of nSignal that can be bought
 */
export function tokensToNSignal(
  _tokensCuratedOnDeployment: Decimal,
  _reserveRatio: Decimal,
  _minimumCurationDeposit: Decimal,
  _curationPoolSignal: Decimal,
  _tokensIn: Decimal,
  _totalNSignal: Decimal,
  _vSignalGNS: Decimal
) {
  const [vSignal, curationTax] = tokensToSignal(
    _tokensCuratedOnDeployment,
    _reserveRatio,
    _minimumCurationDeposit,
    _curationPoolSignal,
    _tokensIn
  );

  const nSignal = vSignalToNSignal(_totalNSignal, vSignal, _vSignalGNS);
  return [vSignal, nSignal, curationTax];
}

/**
 * @dev Calculate vSignal to be returned for an amount of GRT.
 * @param _tokensCuratedOnDeployment Total tokens curated on the SubgraphDeployment
 * @param _reserveRatio Reserve ratio for the SubgraphDeployment (in PPM)
 * @param _minimumCurationDeposit Minimum curation deposit (a global state variable)
 * @param _totalVSignal Total vSignal of the SubgraphDeployment
 * @param _tokensIn The tokens the user wants to spend to mint nSignal
 * @return Amount of vSignal that can be bought
 */
export function tokensToSignal(
  _curationPoolTokens: Decimal,
  _reserveRatio: Decimal,
  _minimumCurationDeposit: Decimal,
  _curationPoolSignal: Decimal,
  _tokensIn: Decimal
): [Decimal, Decimal] {
  let signalOut: Decimal;
  let tax = _tokensIn.mul(CURATION_TAX).div(PPM);
  let tokensMinusTax = _tokensIn.minus(tax); // TODO this shit aint working
  console.log(tax);
  if (_curationPoolTokens == ZERO) {
    if (_tokensIn.lt(_minimumCurationDeposit)) {
      console.error(
        "ERROR: Tokens in must be greater than the minimum curation deposit. This contract call would fail on the EVM. We return [ZERO, ZERO] here."
      );
      return [ZERO, ZERO];
    }

    signalOut = purchaseTargetAmount(
      SIGNAL_PER_MINIMUM_DEPOSIT,
      _minimumCurationDeposit,
      _reserveRatio,
      tokensMinusTax.minus(_minimumCurationDeposit)
    );
  } else {
    signalOut = purchaseTargetAmount(
      _curationPoolSignal,
      _curationPoolTokens,
      _reserveRatio,
      tokensMinusTax
    );
  }
  console.log("tokensToSignal result: ", signalOut);
  return [signalOut, tax];
}

/**
 * @dev Calculate nSignal to be returned for an amount of vSignal.
 * @param _totalNSignal Total nSignal
 * @param _vSignalGNS Total vSignal owned by the GNS (i.e. the reserve token)
 * @param _vSignalIn Amount of vSignal to exchange for name signal
 * @return Amount of nSignal that can be bought
 */
function vSignalToNSignal(
  _totalNSignal: Decimal,
  _vSignalGNS: Decimal,
  _vSignalIn: Decimal
): Decimal {
  // always can initalize at 1 to 1
  if (_vSignalGNS == ZERO) {
    return _vSignalIn;
  }
  // Here we simplify, and do NOT use bancor formula, because we know that the
  // nameReserveRatio should always be 1000000 (i.e. 1 in PPM)
  // The formula simplifies to _nSignal * _vSignalIn / _vSignalGNS
  return _totalNSignal.mul(_vSignalIn).div(_vSignalGNS);
}

export function nSignalToTokens(
  _curationPoolTokens: Decimal,
  _versionReserveRatio: Decimal,
  _minimumCurationDeposit: Decimal,
  _curationPoolSignal: Decimal,
  _tokensIn: Decimal
) {
  //   const tokens = tokensToSignal(
  //     _curationPoolTokens,
  //     _versionReserveRatio,
  //     _minimumCurationDeposit,
  //     _curationPoolSignal,
  //     _tokensIn
  //   );
}

/**
 * @dev given a Signal supply, GRT reserve balance, ratio and a deposit amount (in GRT),
 * calculates the return in Signal (i.e minting signal)
 *
 * Formula:
 * Return = _supply * ((1 + _depositAmount / _reserveBalance) ^ (_reserveRatio / 1000000) - 1)
 *
 * @param supply              token signal supply
 * @param reserveBalance      total GRT balance
 * @param reserveRatio        reserve ratio, represented in ppm, 1 == 1000000
 * @param depositAmount       deposit amount, in GRT
 *
 * @return purchase return amount in Signal
 */
function purchaseTargetAmount(
  supply,
  reserveBalance,
  reserveWeight,
  depositAmount
) {
  [supply, reserveBalance, reserveWeight, depositAmount] = Array.from(
    arguments
  ).map((x) => new Decimal(x));

  // special case for 0 deposit amount
  if (depositAmount.equals(ZERO)) return ZERO;

  // special case if the weight = 100%
  if (reserveWeight.equals(MAX_WEIGHT))
    return supply.mul(depositAmount).div(reserveBalance);

  // return supply * ((1 + amount / reserveBalance) ^ (reserveWeight / MAX_WEIGHT) - 1)
  return supply.mul(
    ONE.add(depositAmount.div(reserveBalance))
      .pow(reserveWeight.div(MAX_WEIGHT))
      .sub(ONE)
  );
}

console.log(
  tokensToNSignal(
    tokensCuratedOnDeployment,
    versionReserveRatio,
    MINIMUM_CURATION_DEPOSIT,
    versionSignalAmount,
    ONE_HUNDRED_THOUSAND_E18,
    nameSignalAmount,
    vSignalGNS
  )
);

/**
 * @dev given a signal supply, GRT reserve balance, ratio and a sell (i.e. burn)
 * amount (in Signal), calculates the return in GRT
 *
 * Formula:
 * Return = _reserveBalance * (1 - (1 - _sellAmount / _supply) ^ (1000000 / _reserveRatio))
 *
 * @param supply              token signal supply
 * @param reserveBalance      total GRT balance
 * @param reserveRatio        reserve ratio, represented in ppm, 1 == 1000000
 * @param sellAmount          sell amount, in Signal
 *
 * @return sale return amount in GRT
 */

function saleTargetAmount(supply, reserveBalance, reserveRatio, sellAmount) {
  [supply, reserveBalance, reserveRatio, sellAmount] = Array.from(
    arguments
  ).map((x) => new Decimal(x));

  // special case for 0 sell amount
  if (sellAmount.equals(ZERO)) return ZERO;

  // special case for selling the entire supply
  if (sellAmount.equals(supply)) return reserveBalance;

  // special case if the weight = 100%
  if (reserveRatio.equals(MAX_WEIGHT))
    return reserveBalance.mul(sellAmount).div(supply);

  // return reserveBalance * (1 - (1 - amount / supply) ^ (MAX_WEIGHT / reserveWeight))
  return reserveBalance.mul(
    ONE.sub(ONE.sub(sellAmount.div(supply)).pow(MAX_WEIGHT.div(reserveRatio)))
  );
}

// 7.28418772514085717714817482331e+21 its okay, its 7284 GRT. but still it aint perfect cuz nSignal

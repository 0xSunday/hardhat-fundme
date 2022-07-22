const networkConfig = {
  31337: {
      name: "localhost",
  },
  4: {
      name: "rinkeby",
      ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },
}

const developmentChains = ["hardhat", "localhost"]
const _decimals =8

const _initialAnswer = 200000000000

module.exports = {
  networkConfig,
  developmentChains,
  _decimals,
  _initialAnswer
}
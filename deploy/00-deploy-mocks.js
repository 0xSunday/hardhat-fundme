const { network } = require("hardhat")
const { developmentChains, _decimals, _initialAnswer } = require("../helper-hardhat.config")

module.exports = async ({ getNamedAccounts, deployments, }) => {

  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
 
  if (developmentChains.includes(network.name)) {
    log("deploying in local network.........")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from:deployer,
      log: true,
      args: [_decimals, _initialAnswer]
    })
    log("mocks deployed....")
    log("-------------------------------------")
  }

}
module.exports.tags = ["all","mocks"]
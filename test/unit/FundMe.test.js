const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat.config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
    let fundMe
    let deployer
    let MockV3Aggregator
    let sendValue = ethers.utils.parseEther("1")
    beforeEach(async () => {
      deployer = (await getNamedAccounts()).deployer
      await deployments.fixture(["all"])
      fundMe = await ethers.getContract("FundMe", deployer)
      MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })

    describe(" constructor", async () => {
      it("sets the aggregator address currectly", async function () {
        const response = await fundMe.priceFeed()
        assert.equal(response, MockV3Aggregator.address)
      })
    })

    describe("fund", async () => {
      it("Fails if you don't send enough ETH", async () => {
        await expect(fundMe.fund()).to.be.revertedWith(
          "You need to spend more ETH!"
        )
      })
      it("updated the amount funded", async () => {
        await fundMe.fund({ value: sendValue })
        const response = await fundMe.addressToAmountFunded(
          deployer
        )
        assert.equal(response.toString(), sendValue.toString())
      })
      it("Adds funder to array of funders", async () => {
        await fundMe.fund({ value: sendValue })
        const response = await fundMe.funders(0)
        assert.equal(response, deployer)
      })
    })
    describe("withdraw", function () {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue })
      })
      it("withdraws ETH from a single funder", async () => {

        const startingFundMeBalance =
          await fundMe.provider.getBalance(fundMe.address)
        const startingDeployerBalance =
          await fundMe.provider.getBalance(deployer)

        const transactionResponse = await fundMe.withdraw()
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        const endingDeployerBalance =
          await fundMe.provider.getBalance(deployer)


        assert.equal(endingFundMeBalance, 0)
        assert.equal(
          startingFundMeBalance
            .add(startingDeployerBalance)
            .toString(),
          endingDeployerBalance.add(gasCost).toString()
        )
      })

      it("is allows us to withdraw with multiple funders", async () => {
        // Arrange
        const accounts = await ethers.getSigners()
        for (i = 1; i < 6; i++) {
          const fundMeConnectedContract = await fundMe.connect(
            accounts[i]
          )
          await fundMeConnectedContract.fund({ value: sendValue })
        }
        const startingFundMeBalance =
          await fundMe.provider.getBalance(fundMe.address)
        const startingDeployerBalance =
          await fundMe.provider.getBalance(deployer)

        const transactionResponse = await fundMe.withdraw()
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
        console.log(`GasCost: ${withdrawGasCost}`)
        console.log(`GasUsed: ${gasUsed}`)
        console.log(`GasPrice: ${effectiveGasPrice}`)
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        const endingDeployerBalance =
          await fundMe.provider.getBalance(deployer)

        assert.equal(
          startingFundMeBalance
            .add(startingDeployerBalance)
            .toString(),
          endingDeployerBalance.add(withdrawGasCost).toString()
        )

        await expect(fundMe.funders(0)).to.be.reverted

        for (i = 1; i < 6; i++) {
          assert.equal(
            await fundMe.addressToAmountFunded(accounts[i].address),
            0
          )
        }
      })
      it("Only allows the owner to withdraw", async function () {
        const accounts = await ethers.getSigners()
        const fundMeConnectedContract = await fundMe.connect(
          accounts[1]
        )
        await expect(
          fundMeConnectedContract.withdraw()
        ).to.be.reverted
      })
    })


  })
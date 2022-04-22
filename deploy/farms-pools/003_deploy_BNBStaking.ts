import { network, run, ethers } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

import { RPC_MAINNET, RPC_TESTNET, BLOCK_LENGTH, REWARD_PER_BLOCK } from "../../utils/config";

export const BNB_STAKING_DID = "BNB_STAKING";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  console.log("Deploying to network:", networkName);

  console.log("Deploying BNB Staking...");

  let provider;

  if (networkName === "mainnet") {
    provider = new ethers.providers.JsonRpcProvider(RPC_MAINNET);
  } else {
    provider = new ethers.providers.JsonRpcProvider(RPC_TESTNET);
  }

  const blockNumber = await provider.getBlockNumber();

  const {deployments, getNamedAccounts} = hre;
  const {deploy, get} = deployments;

  const {deployer, Admin} = await getNamedAccounts();

  const hexa = await get("HexaToken");
  const wbnb = await get("WBNB");

  const deployment = await deploy("BnbStaking", {
    from: deployer,
    args: [
      wbnb.address,
      hexa.address,
      REWARD_PER_BLOCK,
      blockNumber.toString(),
      (blockNumber + Number(BLOCK_LENGTH)).toString(),
      Admin,
      wbnb.address,
    ],
    log: true,
  });
};

export default func;
func.id = BNB_STAKING_DID;
func.tags = ["local", "testnet", "mainnet", "farm-pools", "bnb_staking", BNB_STAKING_DID];
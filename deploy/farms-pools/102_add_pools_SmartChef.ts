import { network, run, ethers } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import { parseEther } from "ethers/lib/utils";

import { RPC_MAINNET, RPC_TESTNET, PT, POOL_REWARD_TOKEN, REWARD_PER_BLOCK, BLOCK_LENGTH } from "../../utils/config";

export const ADD_POOLS_DID = "ADD_POOLS";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  console.log("Deploying to network:", networkName);

  console.log("Adding Pools by using SmartChef...");

  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute} = deployments;

  const {deployer, Admin} = await getNamedAccounts();

  let provider;

  if (networkName === "mainnet") {
    provider = new ethers.providers.JsonRpcProvider(RPC_MAINNET);
  } else {
    provider = new ethers.providers.JsonRpcProvider(RPC_TESTNET);
  }

  const blockNumber = await provider.getBlockNumber();

  if (networkName === "mainnet") {
    await execute(
      "SmartChefFactory",
      {from: deployer, log: true},
      "deployPool",
      PT,
      POOL_REWARD_TOKEN,
      parseEther(REWARD_PER_BLOCK),
      blockNumber.toString(),
      (blockNumber + Number(BLOCK_LENGTH)).toString(),
      parseEther("0"),
      Admin,
    );

    console.log("Added Pool for PT:", PT);
  } else if (networkName === "testnet") {
    const ptDeployment = await deploy("MockBEP20", {
      from: deployer,
      args: [
        "Mock Pool Token 1",
        "PT1",
        parseEther("1000000")
      ],
      log: true,
    });
    console.log("Mock Pool Token:", ptDeployment.address); // 0xa6d1786Fc22c232150885A3D7B22dFe3a5812E0b

    const pool = await deploy("SmartChef", {
      from: deployer,
      args: [
        ptDeployment.address,
        POOL_REWARD_TOKEN,
        parseEther(REWARD_PER_BLOCK),
        blockNumber.toString(),
        (blockNumber + Number(BLOCK_LENGTH)).toString(),
        parseEther("0"),
      ],
      log: true,
    });

    console.log("Pool deployed at", pool.address); // 0x8723e0Ae254C52997DbB2D3CFC0FD9231A25dF0e
  }
};

export default func;
func.id = ADD_POOLS_DID;
func.tags = ["local", "testnet", "mainnet", "farm-pools", "add-pools", ADD_POOLS_DID];
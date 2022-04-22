import { network, run } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

export const WBNB_DID = "WBNB";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  console.log("Deploying to network:", networkName);

  console.log("Deploying WBNB...");

  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  const deployment = await deploy("WBNB", {
    from: deployer,
    args: [
    ],
    log: true,
  });
};

export default func;
func.id = WBNB_DID;
func.tags = ["local", "testnet", "mainnet", "init", "wbnb", WBNB_DID];
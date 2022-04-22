import { network, run } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

export const HEXA_DID = "HEXA";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  console.log("Deploying to network:", networkName);

  console.log("Deploying Hexa Token...");

  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  const deployment = await deploy("HexaToken", {
    from: deployer,
    args: [
    ],
    log: true,
  });
};

export default func;
func.id = HEXA_DID;
func.tags = ["local", "testnet", "mainnet", "farm-pools", "hexa", HEXA_DID];
import { network, run } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

export const SWAP_FACTORY_DID = "SWAP_FACTORY_DID";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName: string = network.name;

  console.log("Deploying to network:", networkName);

  console.log("Deploying HexaFinityFactory...");

  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer, feeSetter} = await getNamedAccounts();

  const deployment = await deploy("HexaFinityFactory", {
    from: deployer,
    args: [
      feeSetter
    ],
    log: true,
  });
};

export default func;
func.id = SWAP_FACTORY_DID;
func.tags = ["local", "testnet", "mainnet", "exchange-protocol", "swap_factory", SWAP_FACTORY_DID];
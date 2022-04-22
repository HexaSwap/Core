import { network, run } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

export const SYRUP_DID = "SYRUP";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  console.log("Deploying to network:", networkName);

  console.log("Deploying SyrupBar...");

  const {deployments, getNamedAccounts} = hre;
  const {deploy, get} = deployments;

  const {deployer} = await getNamedAccounts();

  const hexa = await get("HexaToken");

  const deployment = await deploy("SyrupBar", {
    from: deployer,
    args: [
      hexa.address
    ],
    log: true,
  });

  try {
    await run("verify:verify", {
      address: deployment.address,
      constructorArguments: [
        hexa.address
      ],
    });
    console.log("SyrupBar verify success");
  } catch (e) {
    console.log(e);
  }
};

export default func;
func.id = SYRUP_DID;
func.tags = ["local", "testnet", "mainnet", "farm-pools", "syrup", SYRUP_DID];
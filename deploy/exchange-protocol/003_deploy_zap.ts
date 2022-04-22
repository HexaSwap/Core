import { network, run } from "hardhat";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";

import { MAX_ZAP_REVERSE_RATIO } from "../../utils/config";

export const ZAP_DID = "ZAP_DID";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  console.log("Deploying to network:", networkName);

  // Deploy HexaFinityZapV1
  console.log("Deploying HexaFinityZap V1..");

  const {deployments, getNamedAccounts} = hre;
  const {deploy, get} = deployments;

  const {deployer} = await getNamedAccounts();

  const wbnb = await get("WBNB");
  const router = await get("HexaFinityRouter");

  const deployment = await deploy("HexaFinityZapV1", {
    from: deployer,
    args: [
      wbnb.address,
      router.address,
      MAX_ZAP_REVERSE_RATIO
    ],
    log: true,
  });
};

export default func;
func.id = ZAP_DID;
func.tags = ["local", "testnet", "mainnet", "zap", ZAP_DID];

import { network, run, ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

export const SMART_CHEF_DID = 'SMART_CHEF';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run('compile');
  console.log('Compiled contracts.');

  const networkName = network.name;

  console.log('Deploying to network:', networkName);

  console.log('Deploying SmartChefFactory...');

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const deployment = await deploy('SmartChefFactory', {
    from: deployer,
    args: [],
    log: true,
  });

  try {
    await run('verify:verify', {
      address: deployment.address,
      constructorArguments: [],
    });
    console.log('SmartChefFactory verify success');
  } catch (e) {
    console.log(e);
  }
};

export default func;
func.id = SMART_CHEF_DID;
func.tags = ['local', 'testnet', 'mainnet', 'farm-pools', 'smart-chef', SMART_CHEF_DID];

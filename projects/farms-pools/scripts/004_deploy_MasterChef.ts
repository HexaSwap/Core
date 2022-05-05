import { network, run, ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { RPC_MAINNET, RPC_TESTNET, BLOCK_LENGTH, REWARD_PER_BLOCK } from '../../utils/config';

export const MASTER_CHEF_DID = 'MASTER_CHEF';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run('compile');
  console.log('Compiled contracts.');

  const networkName = network.name;

  console.log('Deploying to network:', networkName);

  console.log('Deploying MasterChef...');

  let provider;

  if (networkName === 'mainnet') {
    provider = new ethers.providers.JsonRpcProvider(RPC_MAINNET);
  } else {
    provider = new ethers.providers.JsonRpcProvider(RPC_TESTNET);
  }

  const blockNumber = await provider.getBlockNumber();

  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;

  const { deployer, dev } = await getNamedAccounts();

  const hexa = await get('HexaToken');
  const syrup = await get('SyrupBar');

  const deployment = await deploy('MasterChef', {
    from: deployer,
    args: [hexa.address, syrup.address, dev, REWARD_PER_BLOCK, blockNumber.toString()],
    log: true,
  });

  try {
    await run('verify:verify', {
      address: deployment.address,
      constructorArguments: [hexa.address, syrup.address, dev, REWARD_PER_BLOCK, blockNumber.toString()],
    });
    console.log('MasterChef verify success');
  } catch (e) {
    console.log(e);
  }
};

export default func;
func.id = MASTER_CHEF_DID;
func.tags = ['local', 'testnet', 'mainnet', 'farm-pools', 'master-chef', MASTER_CHEF_DID];

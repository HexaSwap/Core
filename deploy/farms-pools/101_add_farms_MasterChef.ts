import { network, run, ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { parseEther } from 'ethers/lib/utils';

import { RPC_MAINNET, RPC_TESTNET, LP } from '../../utils/config';

export const ADD_FARMS_DID = 'ADD_FARMS';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run('compile');
  console.log('Compiled contracts.');

  const networkName = network.name;

  console.log('Deploying to network:', networkName);

  console.log('Adding Farms by using MasterChef...');

  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();

  let lp;

  if (networkName === 'mainnet') {
    lp = LP;
  } else if (networkName === 'testnet') {
    const lpDeployment = await deploy('MockBEP20', {
      from: deployer,
      args: ['LPToken', 'LP1', parseEther('1000000')],
      log: true,
    });

    try {
      await run('verify:verify', {
        address: lpDeployment.address,
        constructorArguments: ['LPToken', 'LP1', parseEther('1000000')],
      });
      console.log('MockBEP20 verify success');
    } catch (e) {
      console.log(e);
    }

    lp = lpDeployment.address;
  }

  await execute('MasterChef', { from: deployer, log: true }, 'add', '2000', LP, true);

  console.log('Added Farm for LP:', lp);
};

export default func;
func.id = ADD_FARMS_DID;
func.tags = ['local', 'testnet', 'mainnet', 'farm-pools', 'add-farms', ADD_FARMS_DID];

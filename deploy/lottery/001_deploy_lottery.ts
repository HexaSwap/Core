import { network, run } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import {
  TESTNET_VRF,
  VRF_COORDINATOR_MAINNET,
  VRF_COORDINATOR_TESTNET,
  LINK_MAINNET,
  LINK_TESTNET,
  LINK_FEE_MAINNET,
  LINK_FEE_TESTNET,
  KEY_HASH_MAINNET,
  KEY_HASH_TESTNET,
} from '../../utils/config';

export const LOTTERY_DID = 'LOTTERY';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Compile contracts
  await run('compile');
  console.log('Compiled contracts.');

  const networkName = network.name;

  console.log('Deploying to network:', networkName);

  console.log('Deploying Hexa Token...');

  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, get } = deployments;

  const { deployer, operator, treasury, injector } = await getNamedAccounts();

  const hexa = await get('HexaToken');

  if (networkName == 'testnet') {
    let randomNumberGenerator;

    if (TESTNET_VRF) {
      console.log('RandomNumberGenerator with VRF is deployed..');

      randomNumberGenerator = await deploy('RandomNumberGenerator', {
        from: deployer,
        args: [VRF_COORDINATOR_TESTNET, LINK_TESTNET],
        log: true,
      });

      try {
        await run('verify:verify', {
          address: randomNumberGenerator.address,
          constructorArguments: [VRF_COORDINATOR_TESTNET, LINK_TESTNET],
        });
        console.log('RandomNumberGenerator verify success');
      } catch (e) {
        console.log(e);
      }

      console.log('RandomNumberGenerator deployed to:', randomNumberGenerator.address);

      // Set fee
      await execute('RandomNumberGenerator', { from: deployer, log: true }, 'setFee', LINK_FEE_TESTNET);

      // Set key hash
      await execute('RandomNumberGenerator', { from: deployer, log: true }, 'setKeyHash', KEY_HASH_TESTNET);
    } else {
      console.log('RandomNumberGenerator without VRF is deployed..');

      randomNumberGenerator = await deploy('MockRandomNumberGenerator', {
        from: deployer,
        args: [],
        log: true,
      });

      try {
        await run('verify:verify', {
          address: randomNumberGenerator.address,
          constructorArguments: [],
        });
        console.log('MockRandomNumberGenerator verify success');
      } catch (e) {
        console.log(e);
      }

      console.log('RandomNumberGenerator deployed to:', randomNumberGenerator.address);
    }

    const hexaFinitySwapLottery = await deploy('HexaFinitySwapLottery', {
      from: deployer,
      args: [hexa.address, randomNumberGenerator.address],
      log: true,
    });

    try {
      await run('verify:verify', {
        address: hexaFinitySwapLottery.address,
        constructorArguments: [hexa.address, randomNumberGenerator.address],
      });
      console.log('HexaFinitySwapLottery verify success');
    } catch (e) {
      console.log(e);
    }

    console.log('HexaFinitySwapLottery deployed to:', hexaFinitySwapLottery.address);

    // Set lottery address
    await execute(
      'RandomNumberGenerator',
      { from: deployer, log: true },
      'setLotteryAddress',
      hexaFinitySwapLottery.address,
    );
  } else if (networkName == 'mainnet') {
    const randomNumberGenerator = await deploy('RandomNumberGenerator', {
      from: deployer,
      args: [VRF_COORDINATOR_MAINNET, LINK_MAINNET],
      log: true,
    });

    try {
      await run('verify:verify', {
        address: randomNumberGenerator.address,
        constructorArguments: [VRF_COORDINATOR_MAINNET, LINK_MAINNET],
      });
      console.log('RandomNumberGenerator verify success');
    } catch (e) {
      console.log(e);
    }

    console.log('RandomNumberGenerator deployed to:', randomNumberGenerator.address);

    // Set fee
    await execute('RandomNumberGenerator', { from: deployer, log: true }, 'setFee', LINK_FEE_MAINNET);

    // Set key hash
    await execute('RandomNumberGenerator', { from: deployer, log: true }, 'setKeyHash', KEY_HASH_MAINNET);

    console.log('RandomNumberGenerator deployed to:', randomNumberGenerator.address);

    const hexaFinitySwapLottery = await deploy('HexaFinitySwapLottery', {
      from: deployer,
      args: [hexa.address, randomNumberGenerator.address],
      log: true,
    });

    try {
      await run('verify:verify', {
        address: hexaFinitySwapLottery.address,
        constructorArguments: [hexa.address, randomNumberGenerator.address],
      });
      console.log('HexaFinitySwapLottery verify success');
    } catch (e) {
      console.log(e);
    }

    console.log('HexaFinitySwapLottery deployed to:', hexaFinitySwapLottery.address);

    // Set lottery address
    await execute(
      'RandomNumberGenerator',
      { from: deployer, log: true },
      'setLotteryAddress',
      hexaFinitySwapLottery.address,
    );

    // Set operator & treasury adresses
    await execute(
      'HexaFinitySwapLottery',
      { from: deployer, log: true },
      'setOperatorAndTreasuryAndInjectorAddresses',
      operator,
      treasury,
      injector,
    );
  }
};

export default func;
func.id = LOTTERY_DID;
func.tags = ['local', 'testnet', 'mainnet', 'lottery', 'deploy-lottery', LOTTERY_DID];

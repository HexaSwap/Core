/* eslint-disable node/no-missing-import */
import { Wallet, Contract, providers } from 'ethers';
import { deployContract } from 'ethereum-waffle';
import { expandTo18Decimals, overrides } from './utilities';

import HexaFinityFactory from '../../artifacts/src/exchange-protocol/HexaFinityFactory.sol/HexaFinityFactory.json';
import HexaFinityRouter from '../../artifacts/src/exchange-protocol/HexaFinityRouter.sol/HexaFinityRouter.json';
import HexaFinityRouter01 from '../../artifacts/src/exchange-protocol/HexaFinityRouter01.sol/HexaFinityRouter01.json';
import HexaFinityPair from '../../artifacts/src/exchange-protocol/HexaFinityPair.sol/HexaFinityPair.json';
import HexaFinityMigrator from '../../artifacts/src/exchange-protocol/HexaFinityMigrator.sol/HexaFinityMigrator.json';
import RouterEventEmitter from '../../artifacts/src/exchange-protocol/test/RouterEventEmitter.sol/RouterEventEmitter.json';
import HERC20 from '../../artifacts/src/exchange-protocol/test/HERC20.sol/HERC20.json';
import WETH9 from '../../artifacts/src/exchange-protocol/test/WETH9.sol/WETH9.json';

import HexaFinityV1Exchange from '../../buildV1/HexaFinityV1Exchange.json';
import HexaFinityV1Factory from '../../buildV1/HexaFinityV1Factory.json';

interface CoreFixture {
  token0: Contract;
  token1: Contract;
  WETH: Contract;
  WETHPartner: Contract;
  factoryV1: Contract;
  factoryV2: Contract;
  router01: Contract;
  router02: Contract;
  routerEventEmitter: Contract;
  router: Contract;
  migrator: Contract;
  WETHExchangeV1: Contract;
  pair: Contract;
  WETHPair: Contract;
}

export async function coreFixture([wallet]: Wallet[], provider: providers.Web3Provider): Promise<CoreFixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, HERC20, [expandTo18Decimals(10000)]);
  const tokenB = await deployContract(wallet, HERC20, [expandTo18Decimals(10000)]);
  const WETH = await deployContract(wallet, WETH9);
  const WETHPartner = await deployContract(wallet, HERC20, [expandTo18Decimals(10000)]);

  // deploy factory V1
  const factoryV1 = await deployContract(wallet, HexaFinityV1Factory, []);
  await factoryV1.initializeFactory((await deployContract(wallet, HexaFinityV1Exchange, [])).address);

  // deploy factory V2
  const factoryV2 = await deployContract(wallet, HexaFinityFactory, [wallet.address]);

  // deploy routers
  const router01 = await deployContract(wallet, HexaFinityRouter01, [factoryV2.address, WETH.address], overrides);
  const router02 = await deployContract(
    wallet,
    HexaFinityRouter,
    [factoryV2.address, WETH.address, wallet.address],
    overrides,
  );

  // event emitter for testing
  const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, []);

  // deploy migrator
  const migrator = await deployContract(wallet, HexaFinityMigrator, [factoryV1.address, router01.address], overrides);

  // initialize factory V1
  await factoryV1.createExchange(WETHPartner.address, overrides);
  const WETHExchangeV1Address = await factoryV1.getExchange(WETHPartner.address);
  const WETHExchangeV1 = new Contract(
    WETHExchangeV1Address,
    JSON.stringify(HexaFinityV1Exchange.abi),
    provider,
  ).connect(wallet);

  // initialize factory V2
  await factoryV2.createPair(tokenA.address, tokenB.address);
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address);
  const pair = new Contract(pairAddress, JSON.stringify(HexaFinityPair.abi), provider).connect(wallet);

  const token0Address = await pair.token0();
  const token0 = tokenA.address === token0Address ? tokenA : tokenB;
  const token1 = tokenA.address === token0Address ? tokenB : tokenA;

  await factoryV2.createPair(WETH.address, WETHPartner.address);
  const WETHPairAddress = await factoryV2.getPair(WETH.address, WETHPartner.address);
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(HexaFinityPair.abi), provider).connect(wallet);

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factoryV1,
    factoryV2,
    router01,
    router02,
    routerEventEmitter,
    router: router02,
    migrator,
    WETHExchangeV1,
    pair,
    WETHPair,
  };
}

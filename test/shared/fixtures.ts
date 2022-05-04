/* eslint-disable node/no-missing-import */
import { Wallet, Contract, providers } from 'ethers';
import { deployContract } from 'ethereum-waffle';
import { expandTo18Decimals } from './utilities';

import HexaFinityFactory from '../../artifacts/src/exchange-protocol/HexaFinityFactory.sol/HexaFinityFactory.json';
import HexaFinityRouter from '../../artifacts/src/exchange-protocol/HexaFinityRouter.sol/HexaFinityRouter.json';
import IHexaFinityPair from '../../artifacts/src/exchange-protocol/interfaces/IHexaFinityPair.sol/IHexaFinityPair.json';
import RouterEventEmitter from '../../artifacts/src/exchange-protocol/test/RouterEventEmitter.sol/RouterEventEmitter.json';
import HERC20 from '../../artifacts/src/exchange-protocol/test/HERC20.sol/HERC20.json';
import WETH9 from '../../artifacts/src/exchange-protocol/test/WETH9.sol/WETH9.json';

const overrides = {
  gasLimit: 9999999,
};

interface CoreFixture {
  token0: Contract;
  token1: Contract;
  WETH: Contract;
  WETHPartner: Contract;
  factory: Contract;
  router: Contract;
  routerEventEmitter: Contract;
  pair: Contract;
  WETHPair: Contract;
}

export async function coreFixture(provider: providers.Web3Provider, [wallet]: Wallet[]): Promise<CoreFixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, HERC20, [expandTo18Decimals(10000)]);
  const tokenB = await deployContract(wallet, HERC20, [expandTo18Decimals(10000)]);
  const WETH = await deployContract(wallet, WETH9);
  const WETHPartner = await deployContract(wallet, HERC20, [expandTo18Decimals(10000)]);

  // deploy factory
  const factory = await deployContract(wallet, HexaFinityFactory, [wallet.address]);

  // deploy router
  const router = await deployContract(
    wallet,
    HexaFinityRouter,
    [factory.address, WETH.address, wallet.address],
    overrides,
  );

  // event emitter for testing
  const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, []);

  // initialize factory
  await factory.createPair(tokenA.address, tokenB.address);
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
  const pair = new Contract(pairAddress, JSON.stringify(IHexaFinityPair.abi), provider).connect(wallet);

  const token0Address = await pair.token0();
  const token0 = tokenA.address === token0Address ? tokenA : tokenB;
  const token1 = tokenA.address === token0Address ? tokenB : tokenA;

  await factory.createPair(WETH.address, WETHPartner.address);
  const WETHPairAddress = await factory.getPair(WETH.address, WETHPartner.address);
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(IHexaFinityPair.abi), provider).connect(wallet);

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factory,
    router,
    routerEventEmitter,
    pair,
    WETHPair,
  };
}

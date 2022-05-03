/* eslint-disable node/no-missing-import */
import { expect } from 'chai';
import { BigNumber, constants, Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';
import { getCreate2Address } from '../utils';

import HexaFinityPair from '../../artifacts/src/exchange-protocol/HexaFinityPair.sol/HexaFinityPair.json';

describe('HexaFinityFactory contract', () => {
  let HexaFinityFactory: ContractFactory;
  let factory: Contract;
  let feeToSetter: SignerWithAddress;
  let addr1: SignerWithAddress;

  const TEST_ADDRESSES: [string, string] = [
    '0x1000000000000000000000000000000000000000',
    '0x2000000000000000000000000000000000000000',
  ];

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async () => {
    // Get the ContractFactory and Signers here.
    HexaFinityFactory = await ethers.getContractFactory('HexaFinityFactory');
    [feeToSetter, addr1] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    factory = await HexaFinityFactory.deploy(feeToSetter.address);
  });

  describe('Deployment', () => {
    it('feeTo, feeToSetter, allPairsLength', async () => {
      // feeTo should be zero address
      expect(await factory.feeTo()).to.eq(constants.AddressZero);
      // feeToSetter should be same when set in constructor
      expect(await factory.feeToSetter()).to.eq(feeToSetter.address);
      // allPairsLength should be 0
      expect(await factory.allPairsLength()).to.eq(0);
    });
  });

  async function createPair(tokens: [string, string]) {
    const bytecode = HexaFinityPair.bytecode;
    const create2Address = getCreate2Address(factory.address, tokens, bytecode);
    await expect(factory.createPair(...tokens))
      .to.emit(factory, 'PairCreated')
      .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, BigNumber.from(1));

    await expect(factory.createPair(...tokens)).to.be.revertedWith('HexaFinity: PAIR_EXISTS');
    await expect(factory.createPair(...tokens.slice().reverse())).to.be.revertedWith('HexaFinity: PAIR_EXISTS');
    expect(await factory.getPair(...tokens)).to.eq(create2Address);
    expect(await factory.getPair(...tokens.slice().reverse())).to.eq(create2Address);
    expect(await factory.allPairs(0)).to.eq(create2Address);
    expect(await factory.allPairsLength()).to.eq(1);

    const pair = new Contract(create2Address, JSON.stringify(HexaFinityPair.abi), ethers.provider);
    expect(await pair.factory()).to.eq(factory.address);
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[0]);
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[1]);
  }

  describe('Create pair', () => {
    it('createPair', async () => {
      await createPair(TEST_ADDRESSES);
    });

    it('createPair:reverse', async () => {
      await createPair(TEST_ADDRESSES.slice().reverse() as [string, string]);
    });

    it('createPair:gas', async () => {
      const tx = await factory.createPair(...TEST_ADDRESSES);
      const receipt = await tx.wait();
      expect(receipt.gasUsed).to.eq(2528340);
    });
  });

  describe('setFeeTo', () => {
    it('setFeeTo', async () => {
      await factory.setFeeTo(addr1.address);
      expect(await factory.feeTo()).to.eq(addr1.address);
    });

    it('setFeeTo:Forbidden', async () => {
      // feeToSetter can only change the feeTo, otherwise it is forbidden.
      await expect(factory.connect(addr1).setFeeTo(addr1.address)).to.be.revertedWith('HexaFinity: FORBIDDEN');
    });
  });

  describe('setFeeToSetter', () => {
    it('setFeeToSetter', async () => {
      await factory.setFeeToSetter(addr1.address);
      expect(await factory.feeToSetter()).to.eq(addr1.address);
    });

    it('setFeeToSetter:Forbidden', async () => {
      // feeToSetter can only change the feeTo, otherwise it is forbidden.
      await expect(factory.connect(addr1).setFeeToSetter(addr1.address)).to.be.revertedWith('HexaFinity: FORBIDDEN');
    });
  });
});

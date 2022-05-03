/* eslint-disable node/no-missing-import */
import { expect } from 'chai';
import { constants, Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';
import { expandTo18Decimals } from '../utils';

describe('BEP20 Token contract', () => {
  const TOKEN_NAME = 'TEST BEP20';
  const TOKEN_SYMBOL = 'TBEP';
  const TOTAL_SUPPLY = expandTo18Decimals(10 ** 6);

  let BEP20Token: ContractFactory;
  let token: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async () => {
    // Get the ContractFactory and Signers here.
    BEP20Token = await ethers.getContractFactory('BEP20');
    [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    token = await BEP20Token.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await token.mint(TOTAL_SUPPLY);
  });

  // You can nest describe calls to create subsections.
  describe('Deployment', () => {
    it('Should be set the right owner', async () => {
      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await token.owner()).to.eq(owner.address);
    });

    it('name, symbol, decimals', async () => {
      expect(await token.name()).to.eq(TOKEN_NAME);
      expect(await token.symbol()).to.eq(TOKEN_SYMBOL);
      expect(await token.decimals()).to.eq(18);
    });

    it('Should assign the total supply of tokens to the owner', async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.eq(ownerBalance);
    });

    it('Should assign the total supply of tokens to the owner', async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.eq(ownerBalance);
    });
  });

  describe('Approve', () => {
    it('Approve should emits an Approval event', async () => {
      await expect(token.approve(addr1.address, 50))
        .to.emit(token, 'Approval')
        .withArgs(owner.address, addr1.address, 50);
      expect(await token.allowance(owner.address, addr1.address)).to.eq(50);
    });
  });

  describe('Transfer', () => {
    it('Should transfer tokens between accounts', async () => {
      // Transfer 50 tokens from owner to addr1
      await token.transfer(addr1.address, 50);
      expect(await token.balanceOf(addr1.address)).to.eq(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await token.connect(addr1).transfer(addr2.address, 50);
      expect(await token.balanceOf(addr2.address)).to.eq(50);
    });

    it('Should fail if sender doesn`t have enough tokens', async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(token.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith(
        'BEP20: transfer amount exceeds balance',
      );

      // Owner balance shouldn`t have changed
      expect(await token.balanceOf(owner.address)).to.eq(initialOwnerBalance);
    });

    it('Should update balances after transfers', async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1
      await token.transfer(addr1.address, 100);

      // Transfer 50 tokens from owner to addr2
      await token.transfer(addr2.address, 50);

      // Check balance
      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.eq(initialOwnerBalance.sub(150));
      expect(await token.balanceOf(addr1.address)).to.eq(100);
      expect(await token.balanceOf(addr2.address)).to.eq(50);
    });
  });

  describe('TransferFrom', () => {
    it('Should transfer tokens between accounts', async () => {
      // Approve 100 tokens to addr1
      await token.approve(addr1.address, 100);

      // Transfer 100 tokens from owner to addr1
      await expect(token.connect(addr1).transferFrom(owner.address, addr1.address, 100))
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, addr1.address, 100);

      // addr1`s allowance should be 0
      expect(await token.allowance(owner.address, addr1.address)).to.eq(0);

      // check balance
      expect(await token.balanceOf(addr1.address)).to.eq(100);
      expect(await token.balanceOf(owner.address)).to.eq(TOTAL_SUPPLY.sub(100));
    });
  });

  describe('TransferFrom:max', () => {
    it('Should approve MaxUint256', async () => {
      // Approve max uint256 tokens to addr1
      await token.approve(addr1.address, constants.MaxUint256);

      // Transfer 100 tokens from owner to addr1
      await expect(token.connect(addr1).transferFrom(owner.address, addr1.address, 100))
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, addr1.address, 100);

      // addr1`s allowance should be MaxUint256 - 100
      expect(await token.allowance(owner.address, addr1.address)).to.eq(constants.MaxUint256.sub(100));

      // check balance
      expect(await token.balanceOf(addr1.address)).to.eq(100);
      expect(await token.balanceOf(owner.address)).to.eq(TOTAL_SUPPLY.sub(100));
    });
  });

  describe('increaseAllowance, decreaseAllowance', () => {
    it('Should emit Approval event and increase the allowance when call increaseAllowance', async () => {
      // Increase allowance 100 tokens to addr1
      await expect(token.increaseAllowance(addr1.address, 100))
        .to.emit(token, 'Approval')
        .withArgs(owner.address, addr1.address, 100);
      // Allowance should be 100
      expect(await token.allowance(owner.address, addr1.address)).to.eq(100);
    });

    it('Should emit Approvle event and decrease the allowance when call decreaseAllowance', async () => {
      // Increase allowance 100 tokens to addr1
      await token.increaseAllowance(addr1.address, 100);
      // Decrase allowance 100 tokens from addr1
      await expect(token.decreaseAllowance(addr1.address, 100))
        .to.emit(token, 'Approval')
        .withArgs(owner.address, addr1.address, 0);
      // Allowance should be 0
      expect(await token.allowance(owner.address, addr1.address)).to.eq(0);
    });
  });
});

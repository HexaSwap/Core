import { time } from '@openzeppelin/test-helpers';
import { artifacts, contract } from 'hardhat';
import { assert } from 'chai';

const HexaToken = artifacts.require('HexaToken');
const SyrupBar = artifacts.require('SyrupBar');

contract('SyrupBar', ([alice, bob, minter]) => {
  let hexa, syrup;

  beforeEach(async () => {
    hexa = await HexaToken.new({ from: minter });
    syrup = await SyrupBar.new(hexa.address, { from: minter });
  });

  it('mint', async () => {
    await syrup.mint(alice, 1000, { from: minter });
    assert.equal((await syrup.balanceOf(alice)).toString(), '1000');
  });

  it('burn', async () => {
    await time.advanceBlockTo('650');
    await syrup.mint(alice, 1000, { from: minter });
    await syrup.mint(bob, 1000, { from: minter });
    assert.equal((await syrup.totalSupply()).toString(), '2000');
    await syrup.burn(alice, 200, { from: minter });

    assert.equal((await syrup.balanceOf(alice)).toString(), '800');
    assert.equal((await syrup.totalSupply()).toString(), '1800');
  });

  it('safeHexaTransfer', async () => {
    assert.equal((await hexa.balanceOf(syrup.address)).toString(), '0');
    await hexa.mint(syrup.address, 1000, { from: minter });
    await syrup.safeHexaTransfer(bob, 200, { from: minter });
    assert.equal((await hexa.balanceOf(bob)).toString(), '200');
    assert.equal((await hexa.balanceOf(syrup.address)).toString(), '800');
    await syrup.safeHexaTransfer(bob, 2000, { from: minter });
    assert.equal((await hexa.balanceOf(bob)).toString(), '1000');
  });
});

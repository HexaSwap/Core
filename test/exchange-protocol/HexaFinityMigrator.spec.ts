/* eslint-disable node/no-missing-import */
import chai, { expect } from 'chai';
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle';
import { BigNumber, constants, Contract } from 'ethers';
import { expandTo18Decimals, MINIMUM_LIQUIDITY, overrides } from '../shared/utilities';
import { coreFixture } from '../shared/fixtures';

chai.use(solidity);

const { AddressZero, MaxUint256 } = constants;

describe('HexaFinityMigrator', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  });

  const [owner] = provider.getWallets();
  const loadFixture = createFixtureLoader([owner], provider);

  let WETHPartner: Contract;
  let WETHPair: Contract;
  let router: Contract;
  let migrator: Contract;
  let WETHExchangeV1: Contract;

  beforeEach(async () => {
    const fixture = await loadFixture(coreFixture);
    WETHPartner = fixture.WETHPartner;
    WETHPair = fixture.WETHPair;
    router = fixture.router01; // we used router01 for this contract
    migrator = fixture.migrator;
    WETHExchangeV1 = fixture.WETHExchangeV1;
  });

  it('migrate', async () => {
    const WETHPartnerAmount = expandTo18Decimals(1);
    const ETHAmount = expandTo18Decimals(4);
    await WETHPartner.approve(WETHExchangeV1.address, MaxUint256);
    await WETHExchangeV1.addLiquidity(BigNumber.from(1), WETHPartnerAmount, MaxUint256, {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...overrides,
      value: ETHAmount,
    });
    await WETHExchangeV1.approve(migrator.address, MaxUint256);
    const expectedLiquidity = expandTo18Decimals(2);
    const WETHPairToken0 = await WETHPair.token0();
    await expect(
      migrator.migrate(WETHPartner.address, WETHPartnerAmount, ETHAmount, owner.address, MaxUint256, overrides),
    )
      .to.emit(WETHPair, 'Transfer')
      .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
      .to.emit(WETHPair, 'Transfer')
      .withArgs(AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      .to.emit(WETHPair, 'Sync')
      .withArgs(
        WETHPairToken0 === WETHPartner.address ? WETHPartnerAmount : ETHAmount,
        WETHPairToken0 === WETHPartner.address ? ETHAmount : WETHPartnerAmount,
      )
      .to.emit(WETHPair, 'Mint')
      .withArgs(
        router.address,
        WETHPairToken0 === WETHPartner.address ? WETHPartnerAmount : ETHAmount,
        WETHPairToken0 === WETHPartner.address ? ETHAmount : WETHPartnerAmount,
      );
    expect(await WETHPair.balanceOf(owner.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY));
  });
});

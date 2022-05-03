import { HardhatUserConfig } from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import { node_url, accounts } from './utils/network';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: '0.4.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
    ],
  },
  networks: {
    staging: {
      url: node_url('testnet'),
      accounts: accounts('testnet'),
    },
    production: {
      url: node_url('mainnet'),
      accounts: accounts('mainnet'),
    },
  },
  namedAccounts: {
    deployer: 0,
    dev: 1,
    feeSetter: 2,
    Admin: 3,
    operator: 4,
    treasury: 5,
    injector: 6,
  },
  paths: {
    sources: 'src',
  },
};
export default config;

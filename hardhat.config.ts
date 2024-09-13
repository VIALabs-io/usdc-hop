import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "@typechain/hardhat";

import "./tasks/go";
import "./tasks/configure";

const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

const accounts = [
	process.env.PRIVATE_KEY
];

const config: any = {
	gasReporter: {
		enabled: true,
		token: "ETH",
		coinmarketcap: process.env.CMC_API_KEY || "",
	},
	networks: {	
		"arbitrum-testnet": {
			chainId: 421614,
			url: "https://sepolia-rollup.arbitrum.io/rpc",
			live: false,
			accounts: accounts,
		},
		"avalanche-testnet": {
			chainId: 43113,
			url: "https://api.avax-test.network/ext/bc/C/rpc",
			live: false,
			accounts: accounts,
		},
		"base-testnet": {
			chainId: 84532,
			url: "https://sepolia.base.org",
			live: false,
			accounts: accounts,
		},
		"sepolia-testnet": {
			chainId: 11155111,
			url: "https://eth-sepolia.public.blastapi.io",
			live: false,
			accounts: accounts,
		},
		"optimism-testnet": {
			chainId: 11155420,
			url: "https://sepolia.optimism.io",
			live: false,
			accounts: accounts,
		},
		"polygon-testnet": {
			chainId: 80002,
			url: 'https://rpc-amoy.polygon.technology/',
			live: false,
			accounts: accounts,
		},
		hardhat: {
			live: false,
			deploy: ["deploy/hardhat/"],
		},
	},
	namedAccounts: {
		deployer: 0,
		accountant: 1,
	},
	solidity: {
		compilers: [
			{
				version: "0.8.17",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
				},
			},
		],
	},
};

export default config;

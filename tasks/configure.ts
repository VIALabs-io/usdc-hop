import { task } from "hardhat/config";
const chainsConfig = require('@vialabs-io/contracts/config/chains');
const networks = require("../networks.json");

const fs = require('fs');

task("configure", "")
	.addOptionalParam("signer", "Custom signer (private key)")
	.addOptionalParam("provider", "Custom provider RPC url")
	.setAction(async (args, hre:any) => {
		const ethers = hre.ethers;
		const [deployer] = await ethers.getSigners();

		let signer = deployer;
		if (args.signer) signer = new ethers.Wallet(args.signer, new ethers.providers.JsonRpcProvider(args.provider));
		
		let addresses = [];
		let chainids = [];
		let confirmations=[];
		for(let x=0; x < networks.length; x++) {
			const usdcHop = require(process.cwd()+"/deployments/"+networks[x]+"/USDCHop.json");
			const chainId = fs.readFileSync(process.cwd()+"/deployments/"+networks[x]+"/.chainId").toString();
			addresses.push(usdcHop.address);
			chainids.push(chainId);
			confirmations.push(1);
		}

		const usdcHop = await ethers.getContract("USDCHop");
		
		console.log('configuring contract:', chainsConfig[hre.network.config.chainId].featureGateway);
		await (await usdcHop.configure(chainsConfig[hre.network.config.chainId].featureGateway)).wait();

		console.log('configuring message gateway:', chainsConfig[hre.network.config.chainId].message);
		await (await usdcHop.configureClient(chainsConfig[hre.network.config.chainId].message, chainids, addresses, confirmations)).wait();

		console.log('configuring feature gateway:', chainsConfig[hre.network.config.chainId].featureGateway)
		await (await usdcHop.configureFeatureGateway(chainsConfig[hre.network.config.chainId].featureGateway)).wait();
	});

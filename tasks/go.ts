import { task } from "hardhat/config";
import chainConfig from "@vialabs-io/contracts/config/chains";

task("go", "")
    .addParam("path", "Path")
	.addParam("recipient", "Recipient address")
	.addParam("amount", "Amount to send")
	.addOptionalParam("wallet", "Custom wallet")
	.addOptionalParam("signer", "Custom signer (private key)")
	.addOptionalParam("provider", "Custom provider RPC url")
	.setAction(async (args, hre: any) => {
		const ethers = hre.ethers;
		const [deployer] = await ethers.getSigners();

		let signer = deployer;
		let wallet = deployer.address;
		if (args.signer) signer = new ethers.Wallet(args.signer, new ethers.providers.JsonRpcProvider(args.provider));
		if (args.wallet) wallet = args.wallet;

		const usdc = await ethers.getContractAt("ERC20", chainConfig[hre.network.config.chainId].usdc, signer);
		const usdcHop = await ethers.getContract("USDCHop");

		const amount = ethers.parseUnits(args.amount, await usdc.decimals());
		const pathArray = args.path.split(',');

		console.log('Approving', amount, 'to', await usdcHop.getAddress());
		await (await usdc.connect(signer).approve(await usdcHop.getAddress(), ethers.parseEther("10000000"))).wait();

		console.log('Sending', amount, 'to', args.recipient, 'along path', pathArray);
		await (await usdcHop.go(pathArray, args.recipient, amount)).wait();
	});

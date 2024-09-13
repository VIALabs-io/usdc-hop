# USDC Multi-Hopping Demonstration - ProtoCCTP

This repository is a demonstration of the **ProtoCCTP** feature, which enables **Multi-Hopping** of **USDC** tokens across multiple blockchains. It showcases the VIA Labs' **USDC Multi-Hop** functionality, allowing users to send USDC from a source chain to a final recipient on a destination chain, traversing multiple intermediary chains.

## Overview

**USDCHop** enables users to send **USDC** from one blockchain to another using a predetermined path of chains, ultimately delivering the tokens to the specified final recipient. The transfer of USDC hops from one chain to another until it reaches its destination.

### Features:
- **Cross-chain USDC Transfers**: Initiate a USDC transfer on a source chain and send it across multiple chains until it reaches the destination chain and the final recipient.
- **Customizable Path**: Specify the exact path of chains through which the USDC should be transferred.

This repository demonstrates the **VIA Labs USDC Feature** and the **ProtoCCTP** framework.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** and **npm**
- **Hardhat** for smart contract deployment and management
- An Ethereum-compatible wallet or signer (for example, MetaMask or a private key)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository/usdc-multi-hop.git
   cd usdc-multi-hop
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create .env file with deployment key:
   ```
   cp .env.example .env
   ```
   (add your key to the .env file)

4. Initialize the environment and deploy contracts:
   ```bash
   ./init.sh
   ```

   This script will configure and deploy the necessary contracts on the supported networks.

## Usage

To send USDC across multiple chains with a final recipient, use the Hardhat task as follows:

```bash
npx hardhat go --recipient <FINAL_RECIPIENT_ADDRESS> --amount <AMOUNT_TO_SEND> --path <CHAIN_ID_PATH> --network <NETWORK_NAME>
```

### Example:

Sending 0.1 USDC along the path of chains `421614, 43113, 84532, 11155111, 11155420, 80002` with the final recipient being on **Polygon Testnet**:

```bash
npx hardhat go --recipient 0x0535f0d083761440c1c768e077653FB377a1Fc93 --amount 0.1 --path 421614,43113,84532,11155111,11155420,80002 --network base-testnet
```

### Supported Networks

This repository is configured to work with the following blockchain networks:
- **Arbitrum**
- **Avalanche**
- **Base**
- **Ethereum**
- **Optimism**
- **Polygon**

## Contract - USDCHop

The `USDCHop` smart contract utilizes **ProtoCCTP** to facilitate multi-hop USDC transfers. Here’s a brief overview of the Solidity code:

```solidity
// SPDX-License-Identifier: MIT
// (c)2024 Atlas (atlas@vialabs.io)
pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@vialabs-io/contracts/features/ProtoCCTP.sol";

contract USDCHop is ProtoCCTP {   
    function go(uint[] calldata _path, address _finalRecipient, uint _amount) external {
        address _destSelf = CHAINS[_path[0]].endpoint;
        bytes memory _customData = abi.encode(_finalRecipient, 1, _path);

        SafeERC20.safeTransferFrom(IERC20(usdc), msg.sender, address(this), _amount);
        _sendUSDC(_path[0], _destSelf, _amount, _customData);
    }

    function _processMessageWithFeature(uint, uint, bytes memory _data, uint32, bytes memory, bytes memory) internal override {
        (address _finalRecipient, uint _hop, uint[] memory _path) = abi.decode(_data, (address, uint, uint[]));

        if(_hop >= _path.length) {
            SafeERC20.safeTransfer(IERC20(usdc), _finalRecipient, IERC20(usdc).balanceOf(address(this)));
        } else {
            bytes memory _newData = abi.encode(_finalRecipient, _hop + 1, _path);
            address _destSelf = CHAINS[_path[_hop]].endpoint;
            _sendUSDC(_path[_hop], _destSelf, IERC20(usdc).balanceOf(address(this)), _newData);
        }
    }
}
```

### Key Functionality:
- **`go(uint[] calldata _path, address _finalRecipient, uint _amount)`**: Initiates the transfer of USDC along the specified path of chains. On each hop, it transfers USDC to the next chain in the path.
- **`_processMessageWithFeature(...)`**: Processes messages between chains and continues the transfer along the path, ultimately sending the USDC to the final recipient.

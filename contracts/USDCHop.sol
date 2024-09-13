// SPDX-License-Identifier: MIT
// (c)2024 Atlas (atlas@vialabs.io)
pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@vialabs-io/contracts/features/ProtoCCTP.sol";

contract USDCHop is ProtoCCTP {   
    function go(uint[] calldata _path, address _finalRecipient, uint _amount) external {
        // "this" contract on destination chain of the first hop
        address _destSelf = CHAINS[_path[0]].endpoint;

        // encode custom data to send along with USDC
        bytes memory _customData = abi.encode(
            _finalRecipient, // when we get to the final hop, we will send the USDC to this address
            1, // this is the hop counter, initially set to 1 since WE are sending the first hop below
            _path // path of chais to follow
        );

        SafeERC20.safeTransferFrom(IERC20(usdc), msg.sender, address(this), _amount);
        _sendUSDC(_path[0], _destSelf, _amount, _customData);
    }

    // required processing function, can process multiple features and data
    function _processMessageWithFeature(uint, uint, bytes memory _data, uint32, bytes memory, bytes memory) internal override {
        // decode our custom data
        (address _finalRecipient, uint _hop, uint[] memory _path) = abi.decode(_data, (address, uint, uint[]));

        if(_hop >= _path.length) {
            SafeERC20.safeTransfer(IERC20(usdc), _finalRecipient, IERC20(usdc).balanceOf(address(this)));
        } else {
            // increment the hop counter
            bytes memory _newData = abi.encode(_finalRecipient, _hop+1, _path);

            // "this" contract on destination chain
            address _destSelf = CHAINS[_path[_hop]].endpoint;
            
            // send to next hop
            _sendUSDC(_path[_hop], _destSelf, IERC20(usdc).balanceOf(address(this)), _newData);
        }
    }
}
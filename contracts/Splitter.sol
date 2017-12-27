pragma solidity ^0.4.2;

import "./ConvertLib.sol";

//
// This is just a simple example of sending funds to a smart contract
// The funds are split between two parties specified in the SetAddresses function
// Alice is the sender.  Only when Alice sends, is the money split
// Bob and Carol receive the ether split evenly between them
// 
// Usage:  deploy contract
//         'Alice' sets the addresses for Bob and Carol with SetAddress()
//         'Alice' sends the funds to the contract address
//         1/2 ether sent to each Bob and Carol
//  only quite simple error checking

contract Splitter {
	address owner;	// owner can be anyone
	address alice;  // setter of addresses, and sender of funds
	address bob;    // first of split recipients
	address carol;  // second of split recipients

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event LogAddresses(address _a1, address _a2);

	function Splitter() { // owner can be anyone;
		owner = msg.sender;
	}

	function SetAddresses(address _bob, address _carol) public {
		alice = msg.sender;
		bob = _bob;
		require(bob != 0);
		carol = _carol;
		require(carol != 0);
		LogAddresses(_bob, _carol);
		require (bob != 0);
	}


	function split() payable public returns (bool) {
	uint splitAmount;
		require(msg.sender == alice);  	// only the alice can send funds 
		require(msg.value > 0);        	// send zero or more
		require(bob != 0);				// fail if zero address
		require(carol != 0);			// fail if zero address
		splitAmount = msg.value / 2;	// measured in wei, if we lose one, too bad
		if (!bob.send(splitAmount)) {
			// TODO: handle bob.send error
		}
		Transfer(msg.sender, bob, splitAmount);

		if (!carol.send(splitAmount)) {
			// TODO: handle carol.send error
		}
		Transfer(msg.sender, carol, splitAmount);
		return true;
	}

}

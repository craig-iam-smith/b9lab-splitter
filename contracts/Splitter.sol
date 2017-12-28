pragma solidity ^0.4.2;

import "./ConvertLib.sol";

//
// This is just a simple example of sending funds to a smart contract
// The funds are split between two parties specified in the SetAddresses function
// When ether is sent to this contract, the ether is evenlysplit between two
// recipient addresses
//
// 
// Usage:  deploy contract
//         call the splitFunds function providing the recipient addresses
//         1/2 ether sent to each address
//         recipients must request their funds
//  only quite simple error checking

contract Splitter {
	address owner;	// owner can be anyone
	mapping (address => uint) public balances;

	event LogTransfer(address indexed _sender, address indexed _rec1, address indexed _rec2, uint256 _value);
	event LogWithdrawal(address indexed _withdrawee, uint256 _value);
	event LogAddresses(address _a1, address _a2);

	function Splitter() public { // owner can be anyone;
	}

	

	function splitFunds(address recipient1, address recipient2) 
		public 
		payable  {

		uint splitAmount;
		uint refundAmount;

		LogAddresses(recipient1, recipient2);
		require(msg.value > 0);  	      	// must send more than zero
		require(recipient1 != 0);			// fail if zero address
		require(recipient2 != 0);			// fail if zero address
		splitAmount = msg.value / 2;	// measured in wei, if we lose one, too bad
		refundAmount = msg.value - (2 * splitAmount);

// do the accounting for the splitting of this transaction
		balances[recipient1] += splitAmount;
		balances[recipient2] += splitAmount;
		balances[msg.sender] += refundAmount;
	}

	function withdraw(address withdrawee) public  returns(bool) {

	// only the person who owns the funds can request the funds be sent
		require (msg.sender == withdrawee);

	// if nothing to send, don't call transfer
		require (balances[msg.sender] > 0);

	// withdraw the eth 
		uint amountToSend = balances[msg.sender];
		balances[msg.sender] = 0;  
		msg.sender.transfer(amountToSend);

		LogWithdrawal(msg.sender, balances[msg.sender]);
		return true;
	}

//	function getBalance(address addr) public view returns(uint) {
//		return balances[addr];
//	}

}

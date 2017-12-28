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

/// @title Splitter first exercise contract 
/// @author Craig Smith <craig.iam.smith@gmail.com>
/// @notice Contract to splite funds bilaterally
/// @dev Using the Natspec format

contract Splitter {
	address public owner;
	bool public isRunning;

	mapping (address => uint) public balances;

	event LogTransfer(address indexed _sender, address indexed _rec1, address indexed _rec2, uint256 _value);
	event LogWithdrawal(address indexed _withdrawee, uint256 _value);
	event LogSplitFunds(address indexed _sender, address indexed _recip1, address indexed _recip2, uint256 _value);
	event LogContractRunning(bool _is);

/// @dev Splitter constructor, initializes owner and isRunning
	function Splitter() public { 
		owner = msg.sender;
		isRunning = true;
	}

/// @dev - only owner can pause and unpause the contract
/// @return bool success
	function pauseContract() public 
		onlyOwner
		onlyIfRunning
		returns (bool success) {

		isRunning = false;
		LogContractRunning(isRunning);
		return true;
	}

/// @dev - only owner can pause and unpause the contract 
/// @return bool success
	function unPauseContract()
		public
		onlyOwner
		returns (bool success) {

		require (!isRunning);
		isRunning = true;
		LogContractRunning(isRunning);
		return true;
	}

/// @dev - in an emergency owner of contract can remove all funds from contract
/// @dev - and receive all unclaimed funds, the history is all still available
	function emergencyWithdraw()
		public
		onlyOwner
		returns (bool success) {
		pauseContract();		// stop future transactions
		LogWithdrawal(msg.sender, this.balance);
		msg.sender.transfer(this.balance);
		return true;
	}


/// @param recipient1 address one of receivers of funds
/// @param recipient2 address other of receivers of funds
/// @dev - recipient1 & recipient2 must call withdraw to receive funds
/// @return bool success
	function splitFunds(address recipient1, address recipient2) 
		public 
		onlyIfRunning
		payable  
		returns (bool success) {

		uint splitAmount;
		uint refundAmount;

		require(msg.value > 0);  	      	// must send more than zero
		require(recipient1 != 0);			// fail if zero address
		require(recipient2 != 0);			// fail if zero address
		LogSplitFunds(msg.sender, recipient1, recipient2, msg.value);
		splitAmount = msg.value / 2;		// measured in wei, 
		refundAmount = msg.value - (2 * splitAmount);  // refund leftover to msg.sender

// do the accounting for the splitting of this transaction
		balances[recipient1] += splitAmount;
		balances[recipient2] += splitAmount;
		balances[msg.sender] += refundAmount;

		return true;
	}

/// @dev - any address that has had funds sent to it can withdraw
/// @return bool success
	function withdraw() 
		public  
		onlyIfRunning
		returns(bool success) {

	// if nothing to send, don't call transfer
		require (balances[msg.sender] > 0);

	// withdraw the eth 
		uint amountToSend = balances[msg.sender];
		balances[msg.sender] = 0;  
		msg.sender.transfer(amountToSend);

		LogWithdrawal(msg.sender, balances[msg.sender]);
		return true;
	}

/// @dev - document the modifier
	modifier onlyOwner {
		require(msg.sender == owner);
		_;
	}

	modifier onlyIfRunning {
		require(isRunning);
		_;
	}

}

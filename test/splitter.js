var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

  it("should send equal ether to Recipient1 and Recipient2", function() {
    var split;

    var sendingAccount = accounts[0];
    //    Get initial balances of first and second account.
    var recipient1Account = accounts[1];
    var recipient2Account = accounts[2];

    var Balance;
    var sendingStartingBalance;
    var recipient1StartingBalance;
    var recipient2StartingBalance;
    var sendingEndingBalance;
    var recipient1EndingBalance;
    var recipient2EndingBalance;
    var sendingSum;
    var recipient1Sum;
    var recipient2Sum;


    var sendValue = 10;
    var splitValue = sendValue / 2;
    recipient1StartingBalance = web3.eth.getBalance(recipient1Account);
    assert.equal(recipient1StartingBalance.toNumber(), web3.toWei(100, "ether"), "Bad recipient1StartingBalance");
    recipient2StartingBalance = web3.eth.getBalance(recipient2Account);
    assert.equal(recipient2StartingBalance.toNumber(), web3.toWei(100, "ether"), "Bad recipient2StartingBalance");

    return Splitter.deployed().then(function(instance) {
        split = instance;
        return split.splitFunds.sendTransaction( recipient1Account, recipient2Account, {from: sendingAccount}, {value: web3.toWei(sendValue, "ether")} );
    }).then(function(_txHash) {
        return split.getBalance.call(sendingAccount);
    }).then(function(Balance) {
        sendingSum += Balance;   
        sendingEndingBalance = sendingSum + sendingStartingBalance;
        return split.getBalance.call(recipient1Account);
    }).then(function(Balance) {
        recipient1Sum += Balance;
        return split.getBalance.call(recipient2Account);
    }).then(function(Balance) {
        recipient2Sum += Balance;
        return split.withdraw.sendTransaction( recipient1Account, {from: recipient1Account})
    }).then(function(_txHash) {
        return web3.eth.getBalance(recipient1Account);
    }).then(function(recipient1EndingBalance) {
        assert.equal(recipient1EndingBalance.toNumber(), web3.toWei(104997714400, "gwei"), "Bad recipient1EndingBalance");
        return split.withdraw.sendTransaction( recipient2Account, {from: recipient2Account});
    }).then(function(recipient2EndingBalance) {
        return web3.eth.getBalance(recipient2Account);
    }).then(function(recipient2EndingBalance) {
        assert.equal(recipient2EndingBalance.toNumber(), web3.toWei(104997714400, "gwei"), "Bad recipient2EndingBalance");
    });

  });
});



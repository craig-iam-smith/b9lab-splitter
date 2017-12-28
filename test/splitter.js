var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

  it("should send equal ether to Bob and Carol", function() {
    var split;

    var AliceAccount = accounts[0];
    //    Get initial balances of first and second account.
    var BobAccount = accounts[1];
    var CarolAccount = accounts[2];

    var Balance;
    var AliceStartingBalance;
    var BobStartingBalance;
    var CarolStartingBalance;
    var AliceEndingBalance;
    var BobEndingBalance;
    var CarolEndingBalance;
    var AliceSum;
    var BobSum;
    var CarolSum;


    var sendValue = 10;
    var splitValue = sendValue / 2;
    BobStartingBalance = web3.eth.getBalance(BobAccount);
    assert.equal(BobStartingBalance.toNumber(), web3.toWei(100, "ether"), "Bad BobStartingBalance");
    CarolStartingBalance = web3.eth.getBalance(CarolAccount);
    assert.equal(CarolStartingBalance.toNumber(), web3.toWei(100, "ether"), "Bad CarolStartingBalance");

    return Splitter.deployed().then(function(instance) {
      split = instance;
      return split.SetAddresses(BobAccount, CarolAccount);
    }).then(function() {
        return split.split.sendTransaction( {from: AliceAccount}, {value: web3.toWei(sendValue, "ether")} );
    }).then(function(_txHash) {
        return split.getBalance.call(AliceAccount);
    }).then(function(Balance) {
        AliceSum += Balance;   
        AliceEndingBalance = AliceSum + AliceStartingBalance;
        return split.getBalance.call(BobAccount);
    }).then(function(Balance) {
        BobSum += Balance;
        return split.getBalance.call(CarolAccount);
    }).then(function(Balance) {
        CarolSum += Balance;
        return split.withdraw.sendTransaction( {from: BobAccount})
    }).then(function(_txHash) {
        return web3.eth.getBalance(BobAccount);
    }).then(function(BobEndingBalance) {
        assert.equal(BobEndingBalance.toNumber(), web3.toWei(104997787300, "gwei"), "Bad BobEndingBalance");
        return split.withdraw.sendTransaction( {from: CarolAccount});
    }).then(function(CarolEndingBalance) {
        return web3.eth.getBalance(CarolAccount);
    }).then(function(CarolEndingBalance) {
        assert.equal(CarolEndingBalance.toNumber(), web3.toWei(104997787300, "gwei"), "Bad CarolEndingBalance");
    });

  });
});



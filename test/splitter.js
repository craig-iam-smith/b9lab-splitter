var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

  it("should send equal ether to Bob and Carol", function() {
    var split;

    var AliceAccount = accounts[0];
    //    Get initial balances of first and second account.
    var BobAccount = accounts[1];
    var CarolAccount = accounts[2];

    var BobStartingBalance;
    var CarolStartingBalance;
    var BobEndingBalance;
    var CarolEndingBalance;

    var splitValue = web3.toWei(10, "ether");
    BobStartingBalance = web3.eth.getBalance(BobAccount);
    assert.equal(BobStartingBalance.toNumber(), web3.toWei(100, "ether"), "Bad BobStartingBalance");
    CarolStartingBalance = web3.eth.getBalance(CarolAccount);
    assert.equal(CarolStartingBalance.toNumber(), web3.toWei(100, "ether"), "Bad CarolStartingBalance");

    return Splitter.deployed().then(function(instance) {
      split = instance;
      return split.SetAddresses(BobAccount, CarolAccount);
    }).then(function() {
        return split.split.sendTransaction( {from: AliceAccount}, {value: splitValue} );
    }).then(function(_txHash) {
        return web3.eth.getBalance(AliceAccount);
    }).then(function(AliceEndingBalance) {
       assert.equal(AliceEndingBalance.toNumber(), 89802268100000000000, "Bad AliceEndingBalance");
      return web3.eth.getBalance(BobAccount);
    }).then(function(BobEndingBalance) {
      assert.equal(BobEndingBalance.toNumber(), web3.toWei(105, "ether"), "Bad BobEndingBalance");
        return web3.eth.getBalance(CarolAccount);
    }).then(function(CarolEndingBalance) {
      assert.equal(CarolEndingBalance.toNumber(), web3.toWei(105, "ether"), "Bad CarolEndingBalance");
    });

  });
});

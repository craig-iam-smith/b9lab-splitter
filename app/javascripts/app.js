const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");

//!!! cannot get file-loader to work
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

//require("file-loader?name=../index.html");
// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
// Import libraries we need. 
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import splitter_artifacts from '../../build/contracts/Splitter.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var SplitterContract = contract(splitter_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var AliceA;
var BobA;
var CarolA;


window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    SplitterContract.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      AliceA = accounts[0];
      BobA = accounts[1];
      CarolA = accounts[2];

      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var split;
    SplitterContract.deployed().then(function(instance) {
      split = instance;
      return split.getBalance.call(AliceA, {from: AliceA});
    }).then(function(value) {
      var balance_element = document.getElementById("AliceBalance");
      balance_element.innerHTML = value.valueOf();
      return split.getBalance.call(BobA, {from: BobA});
    }).then(function(value) {
      var balance_element = document.getElementById("BobBalance");
      balance_element.innerHTML = value.valueOf();
      return split.getBalance.call(CarolA, {from: CarolA});
    }).then(function(value) {
      var balance_element = document.getElementById("CarolBalance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var split;
    SplitterContract.deployed().then(function(instance) {
      split = instance;
      return split.sendCoin(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
//  if (typeof web3 !== 'undefined') {
//    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
//    window.web3 = new Web3(web3.currentProvider);
//  } else {
//    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
//  }
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

    App.start();
    return web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length == 0) {
                $("#AliceBalance").html("N/A");
                $("#BobBalance").html("N/A");
                $("#CarolBalance").html("N/A");
                throw new Error("No account with which to transact");
            }
            window.account = accounts[0];
            console.log("ACCOUNT:", window.account);
            return web3.version.getNetworkPromise();
        })
        .then(function(network) {
            return SplitterContract.deployed();
        })
        .then(deployed => deployed.getBalance.call(window.account))
        .then(AliceBalance => $("#AliceBalance").html(AliceBalance.toString(10)))
        .then(BobBalance => $("#BobBalance").html(BobBalance.toString(10)))
        .then(CarolBalance => $("#CarolBalance").html(CarolBalance.toString(10)))        
        .catch(console.error);

});


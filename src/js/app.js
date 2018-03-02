App = {
  web3Provider: null,
  contracts: {},

  //why do we call functions defined within App as App.function?
  //What exactly is the function of Adoption.json (the artifact ABI file of the smart contract Adoption.sol)
  //How are the arguments of these anonymous functions used? How does a constructor work?

/*Numbers, what is parsing. Why does 32-bit int cause rounding errors in js?

I like the arguments variable given to functions

BUT NEED to unlock Rest parameter syntax - is that what all the orange values are in this code?

(let vs. const vs. var)
let, available from block it is enclosed in
const, available from the block it is declared in
var available from the function it is declared in
Blocks don't have scope, only functions?
var declare within an if control structure will be visible to the entire function?

for of vs. for in? (of - concise iteration through an array) (in - do something with a property in an object? (what about a value, function or object in an object?))

since 2015 ECMAscript let and const declars can create block-scoped variables?
*/

  //What is init: called? An object initialized as a function? A prototype?
  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    //Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      //If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      //Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      //Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      //Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error,accounts) {
      if (error) {
        console.log(error);
      }

      /*
      Why is this = 0 and how does this relate to 
      the adopters array of addresses indexed at the petID they adopted?
      */
      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        //Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

import { nft_loan_template } from "./templates.js";
import {
  checkImage,
  addButtonCopy,
  addCopyListener,
  openDialog,
  closeDialogs,
} from "./utils.js";
const web3 = new Web3(window.ethereum);

// the part is related to the DecentralizedFinance smart contract
const defi_contractAddress = "0xBa3F4556647551437A0617F48Ee370A1bbad03b0";
import { defi_abi } from "./abi_decentralized_finance.js";
const defi_contract = new web3.eth.Contract(defi_abi, defi_contractAddress);

// the part is related to the the SimpleNFT smart contract
const nft_contractAddress = "0xE9C9c5f41B1B21Da87acB45A8bDC0dc712a637D7";
import { nft_abi } from "./abi_nft.js";
const nft_contract = new web3.eth.Contract(nft_abi, nft_contractAddress);

let selectedWallet = 0;
let isOwner = false;
async function connectMetaMask() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected account:", accounts[selectedWallet]);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  } else {
    console.error("MetaMask not found. Please install the MetaMask extension.");
  }
  updateWalletsValues();
}

async function updateWalletsValues() {
  if (!window.ethereum) {
    console.error("MetaMask not found. Please install the MetaMask extension.");
    return;
  }
  let accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  if (accounts.length == 0) {
    console.error("No accounts found");
    return;
  }


  let select = document.getElementById("wallet-select");
  select.innerHTML = "";
  accounts.forEach((account, index) => {
    let option = document.createElement("option");
    option.value = index;
    option.textContent = account;
    select.appendChild(option);
  });
  let balance_span = document.getElementById("wallet-balance");
  let balance = await web3.eth.getBalance(accounts[selectedWallet]);
  balance_span.textContent = web3.utils.fromWei(balance, "ether") + " ETH";

  //check if it is the owner
  let owner = await defi_contract.methods.owner().call();
  if (owner.toLowerCase() == accounts[selectedWallet].toLowerCase()) {
    document.getElementById("owner-section").style.display = "block";
    isOwner = true;
  } else {
    document.getElementById("owner-section").style.display = "none";
  }
}

async function setRateEthToDex() {
  let rate = document.getElementById("exchange-rate").value;
  console.log("Setting rate to:", rate);
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  await defi_contract.methods.setDexSwapRate(rate).send({
    from: accounts[selectedWallet],
  });
  closeDialogs();
}

let loans = []; //first fetch, then update when there are events, and use this list to check the loans every 10 minutes
let expired = []; //expired loans
async function getLoans() {
  loans = [];
  let counter = await defi_contract.methods.loanCounter().call();
  for (let i = 1; i <= counter; i++) {
    let loan = await defi_contract.methods.loans(i).call();
    if (loan.borrower == "0x0000000000000000000000000000000000000000") {
      continue;
    }
    loan.id = i;

    loans.push(loan);
    await updateLoanCard(loan, i);
  }
  if (isOwner) {
    checkLoans();
  }
}

async function listenToLoanCreation() {
  await defi_contract.events.loanCreated({}, async (error, event) => {
    if (error) {
      console.error("Error listening to loan creation:", error);
    } else {
      let newId = await defi_contract.methods.loanCounter().call();
      let newLoan = await defi_contract.methods.loans(newId).call();
      newLoan.id = newId;
      loans.push(newLoan);
      console.log("New loan created:", newLoan);
      await updateLoanCard(newLoan, newId);
      //find the new badge and make it visible
      document.getElementById("nft-" + newId + "-badge").style.visibility =
        "visible";
    }
    listenToLoanCreation();
  });
}

//create a div to display the loans
async function updateLoanCard(loan, i) {
  let old = document.getElementById("nft-" + i);
  if (old) {
    old.remove();
  }

  if (loan.borrower == "0x0000000000000000000000000000000000000000") {
    return;
  }
  let payment = await defi_contract.methods.payments(i).call();
  let template = nft_loan_template;
  template = template.replaceAll("nft-x", "nft-" + i);
  let originalTokenURI = "";

  if (loan.isBasedNft) {
    //get the image of t    he nft
    let tokenURI = await nft_contract.methods.tokenURI(loan.nftId).call();
    originalTokenURI = tokenURI;
    //check if it is ipfs or not
    if (tokenURI.startsWith("ipfs")) {
      tokenURI = "https://ipfs.io/ipfs/" + tokenURI.split("://")[1];
    }

    template = template.replace("img_url", tokenURI);
    template = template.replaceAll("nft_id", loan.nftId);
  } else {
    template = template.replace("img_url", "img/eth.png");
    template = template.replaceAll("nft_id", loan.nftId);
  }
  template = template.replaceAll("loan_id", i);
  template = template.replace("0x899..", loan.borrower.substring(0, 5) + "..");
  template = template.replace("0x000..", loan.lender.substring(0, 5) + "..");
  //convert timestamp deadline to date up to seconds
  let deadline = new Date(loan.deadline * 1000).toLocaleString();
  deadline = deadline.substring(0, deadline.length - 3);
  template = template.replace("dead_lines", deadline);
  template = template.replace("due_amount", loan.amount);
  template = template.replace("paid_amount", payment);
  let paid = parseInt(payment);
  let amount = parseInt(loan.amount);
  let percent = (paid / amount) * 100;
  template = template.replaceAll("_paid_offset", percent + "%");
  template = template.replace("_unpaid_offset", 100 - percent + "%");

  let cardList = document.getElementById("nftList");
  if (
    !loan.isBasedNft ||
    (loan.isBasedNft &&
      loan.lender != "0x0000000000000000000000000000000000000000")
  ) {
    //not a nft loan or a nft loan that has been borrowed
    cardList = document.getElementById("allLoans");
  }
  //new ones are added to the top
  cardList.innerHTML = template + cardList.innerHTML;
  if (!loan.isBasedNft) {
    //remove the lend button
    document.getElementById("nft-" + i + "-img").remove();
    document.getElementById("nft-" + i + "-lend").remove();
    document.getElementById("nft-" + i + "-id").remove();
  } else {
    if (loan.lender == "0x0000000000000000000000000000000000000000") {
      document.getElementById("nft-" + i + "-percentage-paid").remove(); //hasn't been borrowed yet
      document.getElementById("nft-" + i + "-paid-container").remove();
      document.getElementById("nft-" + i + "-lender").remove();
    } else {
      document.getElementById("nft-" + i + "-lend").remove();
    }
    let image = document.getElementById("nft-" + i + "-img");
    addCopyListener(image, originalTokenURI);
    checkImage(image);
  }

  //place copy addresses buttons
  let parent = document.getElementById("nft-" + i + "-borrower");
  addButtonCopy(parent, loan.borrower);
  let lender = document.getElementById("nft-" + i + "-lender");
  if (lender) {
    addButtonCopy(lender, loan.lender);
  }
  if (loan.amount == "0") {
    document.getElementById("nft-" + i + "-amount").parentElement.innerHTML =
      "Paid back";
  }
  //#4CAF50
  //check if past deadline
  if (new Date(loan.deadline * 1000) < new Date() || amount <= paid) {
    if (paid < amount) {
      document.getElementById("nft-" + i).style.border = "2px solid red";
    } else {
      document.getElementById("nft-" + i).style.border = "2px solid #4CAF50";
    }
  }
}

async function checkLoans() {
  //check the loans both for the page and the contract
  if (!isOwner) {
    return;
  }
  let unpaid_Total = 0;
  let total_borrowed = 0;
  let newLoans = [];
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  //check the mapping
  await Promise.all(
    loans.map(async (loan, i) => {
      defi_contract.methods.checkLoan(loan.id).send({
        from: accounts[selectedWallet],
      }).then((result) => {
        console.log("Loan checked:", result);
      });

      newLoans.push(loan); //still unpaid
      let payment = await defi_contract.methods.payments(loan.id).call();
      let amount = parseInt(loan.amount);
      let currentPaid = payment;
      if (loan.lender != "0x0000000000000000000000000000000000000000") {
        currentPaid = parseInt(
          document.getElementById("nft-" + loan.id + "-paid").textContent
        );
        unpaid_Total += amount - payment;
        total_borrowed += amount;
      }
      //check if the loan is paid or the payment has changed or the deadline has passed
      if (
        payment != currentPaid ||
        new Date(loan.deadline * 1000) < new Date()
      ) {
        let overdue = false;
        if (amount == payment) {
          document.getElementById("nft-" + loan.id).style.border =
            "2px solid #4CAF50";
        } else if (
          new Date(loan.deadline * 1000) < new Date() &&
          amount > payment
        ) {
          //select the badge and make it visible
          overdue = true;

          document.getElementById("nft-" + loan.id).style.border =
            "2px solid red";
        }
        updateLoanCard(loan, loan.id).then(() => {
          if (overdue) {
            let badge = document.getElementById("nft-" + loan.id + "-badge");
            badge.style.visibility = "visible";
            badge.textContent = "Expired";
            badge.style.backgroundColor = "grey";
            expired.push(loan);
          }
        });
      }
    })
  );
  let paidback = total_borrowed - unpaid_Total;
  document.getElementById("unpaid-total").textContent = unpaid_Total;
  document.getElementById("total-borrowed-eth").textContent = total_borrowed;
  document.getElementById("total-paidback-eth").textContent =
    total_borrowed - unpaid_Total;
  console.log("Total borrowed:", total_borrowed);
  console.log("Total paidback:", paidback);
  console.log("percentage paidback:", (paidback / total_borrowed) * 100 + "%");
  document.getElementById("paid-back-bar").style.width =
    (paidback / total_borrowed) * 100 + "%";

  loans = newLoans;
}

async function buyDex() {
  let unit = document.getElementById("dex-buy-unit").value;
  let amount = document.getElementById("dex-buy-amount").value;
  let dexSwapRate = document.getElementById(
    "exchange-rate-display"
  ).textContent;
  let weiAmount = null;
  switch (unit) {
    case "ETH":
      weiAmount = web3.utils.toWei(amount, "ether");
      break;
    case "Wei":
      weiAmount = amount;
      break;
    case "DEX":
      weiAmount = amount * dexSwapRate;
      break;
    default:
      console.error("Invalid unit:", unit);
      return;
  }

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  await defi_contract.methods.buyDex().send({
    from: accounts[selectedWallet],
    value: weiAmount,
  });
  closeDialogs();
}

async function getDex() {
  let balance_span = document.getElementById("total-tokens");
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  await defi_contract.methods.getDexBalance().call(
    {
      from: accounts[selectedWallet],
    },
    (err, result) => {
      if (err) {
        console.error("Error getting DEX balance:", err);
      } else {
        balance_span.textContent = result + " DEX";
      }
    }
  );
}

async function sellDex() {
  //create a input field for the amount of DEX to sell
  let amount = document.getElementById("dex-sell-amount").value;
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  await defi_contract.methods.sellDex(amount).send({
    from: accounts[selectedWallet],
  });
  closeDialogs();
}

async function loan() {
  let amount = document.getElementById("loan-amount").value;
  let deadline = getDeadlineInSeconds();

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  await defi_contract.methods.loan(amount, deadline).send({
    from: accounts[selectedWallet],
  });
  closeDialogs();
}

async function returnLoan() {
  let loanId = document.getElementById("return-loan-id").value;
  let amount = document.getElementById("return-loan-amount").value;
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  //pay amount
  await defi_contract.methods.returnLoan(loanId).send({
    from: accounts[selectedWallet],
    value: amount,
  });
  closeDialogs();
}

async function getEthTotalBalance() {
  let balance_span = document.getElementById("total-eth");
  await defi_contract.methods.getBalance().call((err, result) => {
    if (err) {
      console.error("Error getting total ETH balance:", err);
    } else {
      balance_span.textContent = result + " wei";
    }
  });
}

async function getRateEthToDex() {
  let rate_span = document.getElementById("exchange-rate-display");
  await defi_contract.methods.dexSwapRate().call((err, result) => {
    if (err) {
      console.error("Error getting exchange rate:", err);
    } else {
      rate_span.textContent = result;
    }
  });
}

async function makeLoanRequestByNft() {
  console.log("Making loan request by NFT");
  let nftId = document.getElementById("nft-loan-id").value;
  let weiamount = document.getElementById("loan-amount").value;
  let deadline = getDeadlineInSeconds();
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  await nft_contract.methods.approve(defi_contractAddress, nftId).send({
    from: accounts[selectedWallet],
  });
  await defi_contract.methods
    .makeLoanRequestByNft(nft_contractAddress, nftId, weiamount, deadline)
    .send({
      from: accounts[selectedWallet],
    });

  closeDialogs();
}

async function cancelLoanRequestByNft() {
  let nftId = document.getElementById("cancel-loan-nft-id").value;
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  await defi_contract.methods
    .cancelLoanRequestByNft(nft_contractAddress, nftId)
    .send({
      from: accounts[selectedWallet],
    });
  let loan = loans.find((loan) => loan.nftId == nftId);
  if (loan) {
    document.getElementById("nft-" + loan.id).remove();
  }
  closeDialogs();
}

async function loanByNft(nftId) {
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
  await defi_contract.methods.loanByNft(nft_contractAddress, nftId).send({
    from: accounts[selectedWallet],
  });
}
function clearExpiredLoans() {
  expired.forEach((loan) => {
    document.getElementById("nft-" + loan.id).remove();
  });
  expired = [];
}
window.connectMetaMask = connectMetaMask;
window.buyDex = buyDex;
window.getDex = getDex;
window.sellDex = sellDex;
window.loan = loan;
window.returnLoan = returnLoan;
window.getEthTotalBalance = getEthTotalBalance;
window.setRateEthToDex = setRateEthToDex;
window.getRateEthToDex = getRateEthToDex;
window.makeLoanRequestByNft = makeLoanRequestByNft;
window.cancelLoanRequestByNft = cancelLoanRequestByNft;
window.loanByNft = loanByNft;
window.listenToLoanCreation = listenToLoanCreation;
window.checkLoans = checkLoans;
window.openDialog = openDialog;
window.clearExpiredLoans = clearExpiredLoans;

updateWalletsValues();
updateValues();
async function updateValues() {
  getEthTotalBalance();
  getRateEthToDex();
  getDex();
}
//update every 5 seconds
setInterval(() => {
  updateValues();
}, 5000);

getLoans();
listenToLoanCreation();
//update every 10 minutes
let checkLoanStatusTimer = setInterval(() => {
  checkLoans();
  console.log("Checking loans");
}, 1000 * 60 * 10);
document
  .getElementById("greyDialog")
  .addEventListener("click", function (event) {
    if (event.target == this) {
      closeDialogs();
    }
  });
closeDialogs();

function getDeadlineInSeconds() {
  let deadline = document.getElementById("loan-deadline").value;
  let deadlineUnit = document.getElementById("loan-deadline-unit").value;
  switch (deadlineUnit) {
    case "Seconds":
      deadline = deadline;
      break;
    case "Minutes":
      deadline = deadline * 60;
      break;
    case "Hours":
      deadline = deadline * 3600;
      break;
    case "Days":
      deadline = deadline * 86400;
      break;
    default:
      console.error("Invalid deadline unit:", deadlineUnit);
      return;
  }
  return deadline;
}

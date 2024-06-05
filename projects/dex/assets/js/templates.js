//loan card template
export function loanTemplate(loan, payment, tokenUri) {
  let deadline = new Date(loan.deadline * 1000).toLocaleString();
  deadline = deadline.substring(0, deadline.length - 3);
  let paid = parseInt(payment);
  let amount = parseInt(loan.amount);
  let percent = (paid / amount) * 100;
  return `
  <div class="loan-card" id="loan-${loan.id}">
    <div style="display: flex; flex-direction=column;">
      <div style="text-align: center;margin-right: 5px;display: flex;flex-direction: column; justify-content: space-between;">
        <div class="new-badge" style="visibility:hidden;" id="loan-${loan.id}-badge">New</div>
      `
      + (tokenUri ? `<img src="${tokenUri}" alt="img" class="copy-image" style="width: 50px; height: 50px;" id="loan-${loan.id}-img" onClick="copyToClipboard('${tokenUri}')" >` : '') +
      `
      <span id="loan-${loan.id}-tooltip" class="tooltip" style="visibility: hidden;">Copied</span>
      `
      +((loan.lender != "0x0000000000000000000000000000000000000000")?
      `
        <div style="display: flex; margin-top: 5px; justify-content: center;" id="loan-${loan.id}-percentage-paid">
          <div style="width: 40px;"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad${loan.id}" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="${percent + "%"}" style="stop-color:rgb(76, 175, 80);stop-opacity:1" />
                  <stop offset="${percent + "%"}" style="stop-color:rgb(255, 255, 255,0);stop-opacity:1" />
                  <stop offset="${100 - percent + "%"}" style="stop-color:rgb(255, 255, 255,0);stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#grad${loan.id})" stroke="black" stroke-width="1" />
            </svg>
          </div>
        </div>
      `:'')
      +
      `</div>
      <div style="display: flex; flex-direction: column; margin-right: 15px;">
        <p id="loan-${loan.id}-loan-id" style="margin: 0 0;">loan#${loan.id}</p>
        `
        + (tokenUri ? `<p id="loan-${loan.id}-id" style="margin: 0 0;">nft#${loan.nftId}</p>` : '') + `
        <!-- show borrower  and lender and deadline and ammount copy icon-->
        <div class="loan-info">
          <div class="borrower address"><span>Borrower: </span><span id="loan-${loan.id}-borrower">${loan.borrower.substring(0, 5) + ".."}</span></div>
          `
          +((loan.lender != "0x0000000000000000000000000000000000000000")?
          `<div class="dress" id="loan-${loan.id}-lender"><span>Lender: </span><span id="loan-${loan.id}-lender">${loan.lender.substring(0, 5) + ".."}</span></div>`:'')
          +
          `
          <div class="deadline">Deadline: <span id="loan-${loan.id}-deadline">${deadline}</span></div>
          <div id="loan-${loan.id}-amount-container">Amount: <span id="loan-${loan.id}-amount">${loan.amount}</span> Wei</div>
          <div id="loan-${loan.id}-paid-container">Paid: <span id="loan-${loan.id}-paid">${paid}</span> Wei</div>
        </div>
      </div>
      `
      + 
      ((loan.lender == "0x0000000000000000000000000000000000000000" && loan.isBasedNft)?`<button style="float: inline-end;" onclick="loanByNft(${loan.nftId})" id="loan-${loan.id}-lend">Lend</button>`:``)
      +
      `
    </div>
  </div>
  `;
}
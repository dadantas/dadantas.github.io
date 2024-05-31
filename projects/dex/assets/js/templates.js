export const nft_loan_template = `
<div class="nft-card" id="nft-x">
  <div style="display: flex; flex-direction=column;">
    <div style="text-align: center;margin-right: 5px;display: flex;flex-direction: column; justify-content: space-between;">
      <div class="new-badge" style="visibility:hidden;" id="nft-x-badge">New</div>
    <img src="img_url" alt="img" class="copy-image" style="width: 50px; height: 50px;" id="nft-x-img">
    <span id="nft-x-tooltip" class="tooltip" style="visibility: hidden;">Copied</span>
      <div style="display: flex; margin-top: 5px; justify-content: center;" id="nft-x-percentage-paid">
        <div style="width: 40px;"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradloan_id" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="_paid_offset" style="stop-color:rgb(76, 175, 80);stop-opacity:1" />
                <stop offset="_paid_offset" style="stop-color:rgb(255, 255, 255,0);stop-opacity:1" />
                <stop offset="_unpaid_offset" style="stop-color:rgb(255, 255, 255,0);stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#gradloan_id)" stroke="black" stroke-width="1" />
          </svg>
        </div>
      </div>
    </div>
    

    <div style="display: flex; flex-direction: column; margin-right: 15px;">
      <p id="nft-x-loan-id" style="margin: 0 0;">loan#loan_id</p>
      <p id="nft-x-id" style="margin: 0 0;">nft#nft_id</p>
      <!-- show borrower  and lender and deadline and ammount copy icon-->
      <div class="loan-info">
        <div class="borrower address"><span>Borrower: </span><span id="nft-x-borrower">0x899..</span></div>
        <div class="dress" id="nft-x-lender"><span>Lender: </span><span id="nft-x-lender">0x000..</span></div>
        <div class="deadline">Deadline: <span id="nft-x-deadline">dead_lines</span></div>
        <div id="nft-x-amount-container">Amount: <span id="nft-x-amount">due_amount</span> Wei</div>
        <div id="nft-x-paid-container">Paid: <span id="nft-x-paid">paid_amount</span> Wei</div>
      </div>
    </div>
    <button style="float: inline-end;" onclick="loanByNft(nft_id)" id="nft-x-lend">Lend</button>
  </div>
</div>
`;
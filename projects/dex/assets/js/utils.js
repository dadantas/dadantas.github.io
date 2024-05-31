// checkImageUrl.js
// https://gist.github.com/ZeeshanMukhtar1/d313da2c0aaa997c4125fcb2e2ca9c77
export const checkImage = (img) => {
  img.onerror = function () {
    img.src =
      "https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/link.png";
  };
};
let copy_button_template = `
<button class="copy-button"><svg  height="15px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.71569 21.2843 9.40973 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.71569 9.40973 9.40973 9.71569 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40973 21.2843 9.71569 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z" stroke="currentColor" stroke-width="inherit" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
`;
export function addButtonCopy(parent, text) {
  parent.innerHTML += copy_button_template;
  let button = parent.lastElementChild;
  addCopyListener(button, text);
}

export function addCopyListener(element, text) {
  console.log("Adding copy listener");
  element.addEventListener("click", function () {
    navigator.clipboard
      .writeText(text)
      .then(function () {
        console.log("Copied to clipboard");
        //show tooltip
        let tooltip = element.parentElement.querySelector(".tooltip");
        tooltip.style.visibility = "visible";
        setTimeout(() => {
          tooltip.style.visibility = "hidden";
        }, 1000);
      })
      .catch(function () {
        console.log("Failed to copy to clipboard");
      });
  });
}

export function openDialog(option) {
  document.getElementById("greyDialog").open = true;
  document.getElementById("greyDialog").style.visibility = "visible";
  switch (option) {
    case "BUY_DEX":
      document.getElementById("buy-dex-dialog").open = true;
      break;
    case "SELL_DEX":
      document.getElementById("sell-dex-dialog").open = true;
      break;
    case "LOAN":
      document.getElementById("loan-dialog").open = true;
      break;
    case "RETURN_LOAN":
      document.getElementById("return-loan-dialog").open = true;
      break;
    case "SET_SWAP_RATE":
      document.getElementById("set-swap-rate-dialog").open = true;
      break;
    case "SET_RATE":
        document.getElementById("set-rate-dialog").open = true;
        break;
    case "CANCEL_LOAN":
        document.getElementById("cancel-loan-dialog").open = true;
        break;
    default:
      console.error("Invalid enumerator:", enumerator);
      break;
  }
}
export function closeDialogs() {
  let parent = document.getElementById("greyDialog");
  parent.open = false;
  parent.querySelectorAll("dialog").forEach((dialog) => {
    dialog.open = false;
  });
  parent.style.visibility = "hidden";
}



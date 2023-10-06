// content.js

let intervalId;

// content.js
document.addEventListener("DOMContentLoaded", function () {
  const buttonXpath = "/html/body/div[4]/div/div[2]/div/div[1]/div[1]/button"
  const button = document.evaluate(xpathExpression, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

  if (button) {
    button.click();
  }
});


intervalId = setInterval(checkGameEnd, 1000);
function rerouteOnGameEnd() {
    // TODO not the real game end element
  const gameEndElement = document.querySelector('#gameEndElement');
  if (gameEndElement && gameEndElement.checkVisibility()) {
    clearInterval(intervalId);
    window.location.href = 'https://www.chess.com/play/online';
  }
}


chrome.scripting.executeScript({
  function: () => {
      // TODO inject spongechess client script and start listening 
    window.cheese = true;
  },
});


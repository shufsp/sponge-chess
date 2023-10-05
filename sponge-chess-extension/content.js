// content.js
const cheeseScript = 
`
(() => {
  // =========================================================
  //   SPONGE CHESS CLIENT v2.0-beta
  // 	 CHESSBOARD VERSION: 1.56.0
  // =========================================================

  const cheese = (board) => {
    const spongePrint = (msg) => console.log(`[SPONGE CHESS] ${msg}`);

    // OUR CHEAT
    spongePrint("Initializing move markers ...")
    const coordinates = document.getElementsByClassName("coordinates")[0];
    const clock = document.getElementsByClassName("clock-time-monospace")[1] 
    const moveMarkerFrom = document.createElementNS("http://www.w3.org/2000/svg", "text");
    moveMarkerFrom.setAttribute("font-size", "5");
    moveMarkerFrom.textContent = "💦";

    const moveMarkerTo = document.createElementNS("http://www.w3.org/2000/svg", "text");
    moveMarkerTo.setAttribute("font-size", "5");
    moveMarkerTo.textContent = "🧽";

    coordinates.appendChild(moveMarkerFrom);
    coordinates.appendChild(moveMarkerTo);

    const coordinatesConfig = {
      originWhite: {
        x: 0.75,
        y: 3.50
      },
      originBlack: {
        x: 88.5,
        y: 90.0
      },
      gapWhite: {
        x: 12.50,
        y: 12.25
      },
      gapBlack: {
        x: -12.50,
        y: -12.25
      }
    }
    const getTimeLeft = () => {
      const splitClock = clock.textContent.split(":")
      const minutesLeft = splitClock[0];
      const secondsLeft = clock.textContent.includes(".") ? splitClock[1].split(".")[0] : splitClock[1];
      return {
        minutes: parseInt(minutesLeft),
        seconds: parseInt(secondsLeft),
        string: clock.textContent
      }
    }
    const getPiecesLeft = () => Object.keys(board.game.getPieces().getCollection()).length;
    const getSquarePixelPosition = (square) => {
      const playingAsWhite = board.game.getPlayingAs() == 1;

      const squareOffsetX = parseInt(square[0], 36) - 10;
      const squareOffsetY = 8 - parseInt(square[1]);

      const originX = playingAsWhite ? coordinatesConfig.originWhite.x : coordinatesConfig.originBlack.x;
      const originY = playingAsWhite ? coordinatesConfig.originWhite.y : coordinatesConfig.originBlack.y;

      const gapX = playingAsWhite ? coordinatesConfig.gapWhite.x : coordinatesConfig.gapBlack.x;
      const gapY = playingAsWhite ? coordinatesConfig.gapWhite.y : coordinatesConfig.gapBlack.y;

      const pixelPositionX = originX + (squareOffsetX * gapX);
      const pixelPositionY = originY + (squareOffsetY * gapY);
      return {
        x: pixelPositionX,
        y: pixelPositionY
      };
    }
    const displayMove = (move) => {
      const fromPosition = getSquarePixelPosition(move.substring(0, 2))
      const toPosition = getSquarePixelPosition(move.substring(2, 4))

      moveMarkerFrom.setAttribute("x", fromPosition.x);
      moveMarkerFrom.setAttribute("y", fromPosition.y);
      moveMarkerTo.setAttribute("x", toPosition.x);
      moveMarkerTo.setAttribute("y", toPosition.y);
    };
    const sendCommand = (async (command) => {
      //spongePrint(`Sending socket command ${command}`)
      await socket.send(command)
    });

    const originalMoveFunction = board.game.move;
    const originalSelectNodeFunction = board.game.selectNode;

    const handleResponseBestMoves = (async (response) => {
      // TODO: only show one move for now
      const moves = response.split(":")[1];
      if (moves === "None") {
        spongePrint("Game Ended. Exiting script :)")
        return; // the game is over
      }
      //spongePrint("Displaying Move")
      displayMove(moves)

      // move automatically
      const moveOptions = {
        color: board.game.getPlayingAs(),
        flags: 2,
        from: moves.substring(0, 2),
        to: moves.substring(2, 4),
        lines: null,
        animate: true,
        userGenerated: true,
        userGeneratedDrop: true,
      }
      const timeLeft = getTimeLeft();
      const piecesCount = getPiecesLeft()
      const minDelay = 700;
      const maxDelay = (piecesCount * 60) + 650;

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      spongePrint(`Delay: ${randomDelay} (${minDelay} - ${maxDelay})`)

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
     
      if (timeLeft.minutes === 0 && timeLeft.seconds < 10) {
        // HURRY UP!
        spongePrint("RUSH MODE! LESS THAN 10 SECONDS LEFT")
        await delay(Math.random() * (350 - 150) + 150)
      }
      else if (board.game.getHistoryFENs().length < 12) {
        // book moves
        spongePrint("Delay shortened for book moves")
        await delay(randomDelay / 2)
      }
      else await delay(randomDelay);
      originalMoveFunction(moveOptions);
    });
    const handleResponseDefault = (response) => {
      spongePrint(`Default response handler ran (${response})`)
    }
    const onMoveHook = (move) => {
      //spongePrint(`get_best_moves:${move.fen}`);
      sendCommand(`get_best_moves:${move.fen}`)
    }


    // CHEAT HOOKS
    // Instead of creating mutation observers or infinite while loops,
    // We intercept the functions to tell at the exact moment when a next move has been played
    spongePrint("Initializing chessboard hooks ...")

    board.game.move = (...args) => {
      // occurs on an actual new move
      //console.log("Moving ... ", ...args, args.length)
      originalMoveFunction.apply(board.game, args);
      //spongePrint(`FEN After Move: ${board.game.getFEN()}`)
      onMoveHook({
        fen: board.game.getFEN()
      })
    };
    board.game.selectNode = (...args) => {
      // occurs when moving forward or backward in move history
      // hooking this so you can go back to previous moves and see the best move at that position
      //console.log("SelectNode", ...args, args.length)
      spongePrint("A node in the moves tree was selected")
      originalSelectNodeFunction.apply(board.game, args)
      onMoveHook({
        fen: board.game.getFEN()
      })
    }


    // OUR SOCKET CONNECTION
    spongePrint("Initializing socket ...")
    spongePrint("CONNECTING TO SPONGECHESS SOCKET SERVER (YOU BETTER HAVE IT RUNNING)")
    const socket = new WebSocket("ws://localhost:8765");

    socket.onopen = (event) => {
      spongePrint(`Connected to SpongeChess socket server: ${event.data}`);
      sendCommand(`get_best_moves:${board.game.getFEN()}`);
      sendCommand(`set_depth:5`)
      sendCommand(`set_elo:1600`)
      spongePrint("")
      spongePrint("====================================")
      spongePrint("ELO: 1600")
      spongePrint("DEPTH: 3")
      spongePrint("====================================")
      spongePrint("")
    }
    socket.onmessage = (event) => {
      const msg = event.data;
      spongePrint(`Server ~ $ ${msg}`)
      if (msg.startsWith("best_move")) {
        handleResponseBestMoves(msg);
      } else {
        handleResponseDefault(msg);
      }
    };
    socket.onclose = (event) => {
      if (event.wasClean) {
        spongePrint(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        spongePrint("Connection died");
      }
    };
  };


  (() => {
    const checkGameInterval = setInterval(() => {
      const board = document.getElementsByClassName("board")[0];

      if (board.game) {
        clearInterval(checkGameInterval); // Stop checking
        // Hook function to listen for game start
        if (board.game.getMode().name === "playing") {
          console.log("Hooking ...");
          cheese(board);
        }
      }
    }, 10);
  })();

})()

`

// Function to check if a signal has been received or an element has appeared
function checkForSignalOrElement() {
    let gameOverModalSection = document.getElementsByClassName("modal-content-component")[0];
    if (gameOverModalSection && gameOverModalSection.checkVisibility()){
        clearInterval(t)
        console.log("GAME END DETECTED !")
        return true;
    }
    return false;
}

function inject() {
  // Inject sponge chess client script
  const script = document.createElement("script");
  script.textContent = cheeseScript;
  document.body.appendChild(script);
}

function redirectAfterGameOver(url) {
  // check for game over
  const intervalId = setInterval(() => {
    if (checkForSignalOrElement()) {
      clearInterval(intervalId);
      window.location.href = url;
    }
  }, 1000); // Check every second (adjust the interval as needed)
}

// Check if we are on the chess.com game page
if (window.location.href.includes("https://www.chess.com/play/online")) {
    // start game search
    // clicks the green play button at chess.com/play/online
    document.evaluate('/html/body/div[4]/div/div[2]/div/div[1]/div[1]/button', 
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();


  // Wait for game start
  const checkGameInterval = setInterval(() => {
      const board = document.getElementsByClassName("board")[0];

      if (board.game) {
        clearInterval(checkGameInterval); // Stop checking
        // Hook function to listen for game start
        if (board.game.getMode().name === "playing") {
          // we wait long enough 
          console.log("Hooking ...");
          setTimeout(() => {
            console.log("Injecting")
            inject()
            redirectAfterGameOver("https://www.chess.com/play/online")
          }, 2500)
        }
      }
    }, 10);
}


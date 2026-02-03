// =====================
// GLOBAL STATE
// =====================
let game = new Chess();
let board;

let currentMoves = [];
let moveIndex = 0;

// =====================
// INIT AFTER DOM READY
// =====================
document.addEventListener("DOMContentLoaded", () => {

  board = Chessboard("board", {
    draggable: true,
    position: "start",
    pieceTheme:
      "https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/img/chesspieces/wikipedia/{piece}.png",
    onDrop: onDrop
  });

  // Load opening AFTER board exists
  loadOpening("fried_liver");

  // iPad Safari resize fix
  setTimeout(() => {
    board.resize();
  }, 300);
});

// =====================
// LOAD OPENING
// =====================
function loadOpening(openingId) {
  fetch(`openings/${openingId}.json`)
    .then(res => res.json())
    .then(data => {
      currentMoves = data.lines[0].moves;
      moveIndex = 0;
      game.reset();
      board.position("start");

      document.getElementById("openingName").innerText = data.name;
      showMessage("Play the next move", "#333");
      updateProgress();
    })
    .catch(() => {
      showMessage("Failed to load opening", "red");
    });
}

// =====================
// MOVE HANDLER
// =====================
function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: "q"
  });

  if (!move) return "snapback";

  // WRONG MOVE
  if (move.san !== currentMoves[moveIndex]) {
    game.undo();
    showMessage("❌ Wrong move", "#e53935");
    return "snapback";
  }

  // CORRECT MOVE
  showMessage("✔ Correct", "#4caf50");
  moveIndex++;
  updateProgress();

  // AUTO OPPONENT MOVE
  if (moveIndex < currentMoves.length) {
    game.move(currentMoves[moveIndex]);
    moveIndex++;
    board.position(game.fen());
    updateProgress();
  }

  // END OF LINE
  if (moveIndex >= currentMoves.length) {
    showMessage("🎉 Line completed!", "#2e7d32");
  }
}

// =====================
// UI HELPERS
// =====================
function showMessage(text, color) {
  const el = document.getElementById("message");
  el.innerText = text;
  el.style.color = color;
}

function updateProgress() {
  const fill = document.getElementById("progressFill");
  fill.style.width = (moveIndex / currentMoves.length) * 100 + "%";
}

// =====================
// BUTTON ACTIONS
// =====================
function showHint() {
  if (moveIndex < currentMoves.length) {
    showMessage("Hint: " + currentMoves[moveIndex], "#ff9800");
  }
}

function resetLine() {
  game.reset();
  moveIndex = 0;
  board.position("start");
  updateProgress();
  showMessage("Line reset", "#333");
}

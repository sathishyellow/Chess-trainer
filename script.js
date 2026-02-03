// =====================
// GLOBAL STATE
// =====================
let game = new Chess();
let board = null;

let currentMoves = [];
let moveIndex = 0;

// =====================
// INITIALIZE BOARD (IMPORTANT FOR iPad)
// =====================
document.addEventListener("DOMContentLoaded", () => {
  board = Chessboard("board", {
    draggable: true,
    position: "start",
    onDrop: onDrop
  });

  // Load opening AFTER board exists
  loadOpening("fried_liver");

  // iPad Safari fix: force resize
  setTimeout(() => {
    board.resize();
  }, 300);
});

// =====================
// LOAD OPENING
// =====================
function loadOpening(openingId) {
  fetch(`openings/${openingId}.json`)
    .then(response => response.json())
    .then(data => {
      currentMoves = data.lines[0].moves;
      moveIndex = 0;
      game.reset();
      board.position("start");

      const title = document.getElementById("openingName");
      if (title) title.innerText = data.name;

      showMessage("Play the next move", "#333");
      updateProgress();
    })
    .catch(err => {
      console.error("Opening load error:", err);
      showMessage("Failed to load opening", "red");
    });
}

// =====================
// MOVE HANDLER
// =====================
function onDrop(source, target) {
  let move = game.move({
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
  const msg = document.getElementById("message");
  if (!msg) return;
  msg.innerText = text;
  msg.style.color = color;
}

function updateProgress() {
  const bar = document.getElementById("progressFill");
  if (!bar || currentMoves.length === 0) return;
  bar.style.width = (moveIndex / currentMoves.length) * 100 + "%";
}

// =====================
// BUTTONS
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

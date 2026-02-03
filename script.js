let game = new Chess();
let board;
let currentOpening = null;
let currentMoves = [];
let moveIndex = 0;

board = Chessboard("board", {
  draggable: true,
  position: "start",
  onDrop: onDrop
});

loadOpening("fried_liver");

function loadOpening(openingId) {
  fetch(`openings/${openingId}.json`)
    .then(res => res.json())
    .then(data => {
      currentOpening = data;
      currentMoves = data.lines[0].moves;
      game.reset();
      moveIndex = 0;
      board.position("start");
      document.getElementById("openingName").innerText = data.name;
      showMessage("Play the next move", "#333");
      updateProgress();
    });
}

function onDrop(source, target) {
  let move = game.move({ from: source, to: target, promotion: "q" });
  if (!move) return "snapback";
  if (move.san !== currentMoves[moveIndex]) {
    game.undo();
    showMessage("❌ Wrong move", "#e53935");
    return "snapback";
  }
  showMessage("✔ Correct", "#4caf50");
  moveIndex++;
  updateProgress();
  if (moveIndex < currentMoves.length) {
    game.move(currentMoves[moveIndex]);
    moveIndex++;
    board.position(game.fen());
    updateProgress();
  }
  if (moveIndex >= currentMoves.length) {
    showMessage("🎉 Line completed!", "#2e7d32");
  }
}

function showMessage(text, color) {
  const msg = document.getElementById("message");
  msg.innerText = text;
  msg.style.color = color;
}

function updateProgress() {
  const percent = (moveIndex / currentMoves.length) * 100;
  document.getElementById("progressFill").style.width = percent + "%";
}

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

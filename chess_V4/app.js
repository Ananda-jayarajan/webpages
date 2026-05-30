import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1/+esm";
import { ENABLE_MULTIPLAYER, firebaseConfig } from "./firebase-config.js";

let dbApi = null;
let db = null;
let multiplayerReady = false;

if (ENABLE_MULTIPLAYER) {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js");
    dbApi = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js");
    const app = initializeApp(firebaseConfig);
    db = dbApi.getDatabase(app);
    multiplayerReady = true;
  } catch (error) {
    console.error(error);
  }
}

const boardEl = document.getElementById("board");
const moveListEl = document.getElementById("moveList");
const moveHintEl = document.getElementById("moveHint");
const usernameInput = document.getElementById("usernameInput");
const roomCodeInput = document.getElementById("roomCodeInput");
const joinBtn = document.getElementById("joinBtn");
const statusBox = document.getElementById("statusBox");
const currentRoomEl = document.getElementById("currentRoom");
const yourSeatEl = document.getElementById("yourSeat");
const gameStatusEl = document.getElementById("gameStatus");
const whiteNameEl = document.getElementById("whiteName");
const blackNameEl = document.getElementById("blackName");
const whiteStatusEl = document.getElementById("whiteStatus");
const blackStatusEl = document.getElementById("blackStatus");
const promotionBox = document.getElementById("promotionBox");
const promotionChoices = document.getElementById("promotionChoices");

const ROOM_PATTERN = /^[A-Z]{3}[0-9]{3}$/;
const PIECE_UNICODE = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟"
};

let chess = new Chess();
let currentRoomCode = "";
let currentRoom = null;
let playerColor = null;
let selectedSquare = null;
let legalTargets = [];
let unsubscribeRoom = null;
let pendingPromotion = null;

const clientId = getClientId();

function getClientId() {
  const key = "simple-chess-client-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID ? crypto.randomUUID() : `guest-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, value);
  }
  return value;
}

function setStatus(message, type = "warn") {
  statusBox.className = `status ${type}`;
  statusBox.textContent = message;
}

function roomRef(code) {
  return dbApi.ref(db, `rooms/${code}`);
}

function cleanUsername(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 18);
}

function cleanRoomCode(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function blankRoom(username) {
  return {
    fen: new Chess().fen(),
    players: {
      white: { id: clientId, name: username },
      black: null
    },
    moves: [],
    result: "",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function getMyColor(room) {
  if (!room?.players) return null;
  if (room.players.white?.id === clientId) return "w";
  if (room.players.black?.id === clientId) return "b";
  return "spectator";
}

function bothPlayersReady(room) {
  return Boolean(room?.players?.white?.id && room?.players?.black?.id);
}

function filesForColor() {
  return playerColor === "b"
    ? ["h", "g", "f", "e", "d", "c", "b", "a"]
    : ["a", "b", "c", "d", "e", "f", "g", "h"];
}

function ranksForColor() {
  return playerColor === "b"
    ? ["1", "2", "3", "4", "5", "6", "7", "8"]
    : ["8", "7", "6", "5", "4", "3", "2", "1"];
}

function squareAt(row, col) {
  return `${filesForColor()[col]}${ranksForColor()[row]}`;
}

function isLightSquare(square) {
  const file = square.charCodeAt(0) - 96;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 1;
}

function pieceImagePath(color, type) {
  return `assets/pieces/${color}${type}.png`;
}

function createPieceElement(type, color) {
  const code = `${color}${type}`;
  const holder = document.createElement("span");
  holder.className = "piece";

  const img = document.createElement("img");
  img.className = "piece-img";
  img.src = pieceImagePath(color, type);
  img.alt = code;

  const fallback = document.createElement("span");
  fallback.className = `fallback-piece ${color === "b" ? "black" : "white"}`;
  fallback.textContent = PIECE_UNICODE[code] || "?";

  img.addEventListener("error", () => {
    img.style.display = "none";
    fallback.style.display = "grid";
  });

  holder.append(img, fallback);
  return holder;
}

function lastMoveSquares() {
  const moves = currentRoom?.moves || [];
  const last = moves[moves.length - 1];
  return last ? [last.from, last.to] : [];
}

function findKingSquare(color) {
  const board = chess.board();
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (piece && piece.type === "k" && piece.color === color) {
        return `${"abcdefgh"[col]}${8 - row}`;
      }
    }
  }
  return null;
}

function renderBoard() {
  boardEl.innerHTML = "";
  const files = filesForColor();
  const ranks = ranksForColor();
  const lastSquares = lastMoveSquares();
  const checkSquare = chess.isCheck() ? findKingSquare(chess.turn()) : null;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = squareAt(row, col);
      const piece = chess.get(square);
      const squareEl = document.createElement("button");
      squareEl.type = "button";
      squareEl.className = `square ${isLightSquare(square) ? "light" : "dark"}`;
      squareEl.dataset.square = square;

      if (selectedSquare === square) squareEl.classList.add("selected");
      if (lastSquares.includes(square)) squareEl.classList.add("last-move");
      if (legalTargets.includes(square)) squareEl.classList.add(piece ? "capture" : "legal");
      if (checkSquare === square) squareEl.classList.add("check");

      if (col === 0) {
        const rankLabel = document.createElement("span");
        rankLabel.className = "coord rank";
        rankLabel.textContent = ranks[row];
        squareEl.append(rankLabel);
      }

      if (row === 7) {
        const fileLabel = document.createElement("span");
        fileLabel.className = "coord file";
        fileLabel.textContent = files[col];
        squareEl.append(fileLabel);
      }

      if (piece) squareEl.append(createPieceElement(piece.type, piece.color));
      squareEl.addEventListener("click", () => handleSquareClick(square));
      boardEl.append(squareEl);
    }
  }
}

function renderMoves() {
  const moves = currentRoom?.moves || [];
  moveListEl.innerHTML = "";
  moveHintEl.textContent = moves.length ? "" : "No moves yet.";

  for (let i = 0; i < moves.length; i += 2) {
    const li = document.createElement("li");
    const number = document.createElement("span");
    number.className = "move-number";
    number.textContent = `${i / 2 + 1}.`;
    li.append(number, document.createTextNode(` ${moves[i]?.san || ""}`));
    if (moves[i + 1]) li.append(document.createTextNode(`   ${moves[i + 1].san}`));
    moveListEl.append(li);
  }
}

function colorWord(color) {
  if (color === "w") return "White";
  if (color === "b") return "Black";
  return "Spectator";
}

function gameStatusText() {
  if (!currentRoomCode) return "Enter username and room code";
  if (!currentRoom) return "Loading room";
  if (!bothPlayersReady(currentRoom)) return "Waiting for second player";
  if (currentRoom.result === "draw") return "Draw";
  if (currentRoom.result === "white_wins") return "White wins";
  if (currentRoom.result === "black_wins") return "Black wins";
  if (chess.isCheckmate()) return `${colorWord(chess.turn() === "w" ? "b" : "w")} wins by checkmate`;
  if (chess.isDraw()) return "Draw";
  if (chess.isCheck()) return `${colorWord(chess.turn())} is in check`;
  return `${colorWord(chess.turn())} to move`;
}

function renderRoomInfo() {
  currentRoomEl.textContent = currentRoomCode || "—";
  yourSeatEl.textContent = playerColor ? colorWord(playerColor) : "Not joined";
  gameStatusEl.textContent = gameStatusText();

  const white = currentRoom?.players?.white;
  const black = currentRoom?.players?.black;

  whiteNameEl.textContent = white?.name || "White";
  blackNameEl.textContent = black?.name || "Black";

  whiteStatusEl.textContent = white ? "White player" : "Waiting";
  blackStatusEl.textContent = black ? "Black player" : "Waiting";
}

function renderAll() {
  renderBoard();
  renderMoves();
  renderRoomInfo();
}

function clearSelection() {
  selectedSquare = null;
  legalTargets = [];
}

function canMove() {
  if (!currentRoomCode || !currentRoom) return false;
  if (!bothPlayersReady(currentRoom)) return false;
  if (playerColor !== "w" && playerColor !== "b") return false;
  if (chess.isGameOver() || currentRoom.result) return false;
  return chess.turn() === playerColor;
}

function selectSquare(square) {
  const piece = chess.get(square);
  if (!piece) return;
  if (!canMove()) return;
  if (piece.color !== playerColor) return;
  selectedSquare = square;
  legalTargets = chess.moves({ square, verbose: true }).map(move => move.to);
}

function needsPromotion(from, to) {
  const piece = chess.get(from);
  if (!piece || piece.type !== "p") return false;
  return (piece.color === "w" && to.endsWith("8")) || (piece.color === "b" && to.endsWith("1"));
}

function showPromotion(from, to) {
  pendingPromotion = { from, to };
  promotionChoices.innerHTML = "";
  const color = chess.get(from).color;

  for (const type of ["q", "r", "b", "n"]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "promotion-choice";
    button.append(createPieceElement(type, color));
    button.addEventListener("click", async () => {
      promotionBox.classList.add("hidden");
      const moveRequest = pendingPromotion;
      pendingPromotion = null;
      await makeMove(moveRequest.from, moveRequest.to, type);
    });
    promotionChoices.append(button);
  }

  promotionBox.classList.remove("hidden");
}

async function handleSquareClick(square) {
  if (pendingPromotion) return;

  const clickedPiece = chess.get(square);

  if (!selectedSquare) {
    selectSquare(square);
    renderAll();
    return;
  }

  if (selectedSquare === square) {
    clearSelection();
    renderAll();
    return;
  }

  if (clickedPiece && clickedPiece.color === playerColor) {
    selectSquare(square);
    renderAll();
    return;
  }

  if (!legalTargets.includes(square)) {
    clearSelection();
    renderAll();
    return;
  }

  if (needsPromotion(selectedSquare, square)) {
    showPromotion(selectedSquare, square);
    return;
  }

  await makeMove(selectedSquare, square);
}

async function makeMove(from, to, promotion = "q") {
  if (!canMove()) {
    setStatus("You cannot move yet. Wait for your friend or your turn.", "warn");
    clearSelection();
    renderAll();
    return;
  }

  await dbApi.runTransaction(roomRef(currentRoomCode), room => {
    if (!room || !bothPlayersReady(room) || room.result) return room;

    const temp = new Chess(room.fen);
    const activeColor = temp.turn();
    if (activeColor !== playerColor) return room;

    const move = temp.move({ from, to, promotion });
    if (!move) return room;

    let result = "";
    if (temp.isCheckmate()) result = activeColor === "w" ? "white_wins" : "black_wins";
    else if (temp.isDraw()) result = "draw";

    return {
      ...room,
      fen: temp.fen(),
      result,
      moves: [
        ...(room.moves || []),
        {
          color: move.color,
          from: move.from,
          to: move.to,
          san: move.san,
          piece: move.piece,
          captured: move.captured || "",
          promotion: move.promotion || ""
        }
      ],
      updatedAt: Date.now()
    };
  });

  clearSelection();
}

async function joinRoom() {
  const username = cleanUsername(usernameInput.value);
  const code = cleanRoomCode(roomCodeInput.value);
  roomCodeInput.value = code;

  if (!multiplayerReady) {
    setStatus("Multiplayer is OFF. Add Firebase config and set ENABLE_MULTIPLAYER = true in firebase-config.js.", "bad");
    return;
  }

  if (!username) {
    setStatus("Enter a username first.", "warn");
    usernameInput.focus();
    return;
  }

  if (!ROOM_PATTERN.test(code)) {
    setStatus("Room code must be 3 capital letters and 3 numbers, like ABC123.", "warn");
    roomCodeInput.focus();
    return;
  }

  localStorage.setItem("simple-chess-username", username);

  await dbApi.runTransaction(roomRef(code), room => {
    if (!room) return blankRoom(username);

    const alreadyWhite = room.players?.white?.id === clientId;
    const alreadyBlack = room.players?.black?.id === clientId;

    if (alreadyWhite) {
      room.players.white.name = username;
      return room;
    }

    if (alreadyBlack) {
      room.players.black.name = username;
      return room;
    }

    if (!room.players?.white?.id) {
      room.players = { ...(room.players || {}), white: { id: clientId, name: username } };
      return room;
    }

    if (!room.players?.black?.id) {
      room.players = { ...(room.players || {}), black: { id: clientId, name: username } };
      return room;
    }

    return room;
  });

  currentRoomCode = code;
  location.hash = code;

  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = dbApi.onValue(roomRef(code), snapshot => {
    currentRoom = snapshot.val();
    if (!currentRoom) return;

    chess = new Chess(currentRoom.fen || new Chess().fen());
    playerColor = getMyColor(currentRoom);

    if (playerColor === "w") {
      setStatus(`Joined room ${code} as White. Send code ${code} to your friend.`, "good");
    } else if (playerColor === "b") {
      setStatus(`Joined room ${code} as Black. You can play now.`, "good");
    } else {
      setStatus(`Room ${code} already has two players. You are viewing only.`, "warn");
    }

    clearSelection();
    renderAll();
  });
}

roomCodeInput.addEventListener("input", () => {
  roomCodeInput.value = cleanRoomCode(roomCodeInput.value);
});

joinBtn.addEventListener("click", joinRoom);

usernameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") roomCodeInput.focus();
});

roomCodeInput.addEventListener("keydown", event => {
  if (event.key === "Enter") joinRoom();
});

const savedName = localStorage.getItem("simple-chess-username");
if (savedName) usernameInput.value = savedName;

if (location.hash) {
  const hashCode = cleanRoomCode(location.hash.replace("#", ""));
  if (ROOM_PATTERN.test(hashCode)) roomCodeInput.value = hashCode;
}

if (multiplayerReady) {
  setStatus("Ready. Enter username and room code to create or join a game.", "good");
} else {
  setStatus("Multiplayer is OFF. Add Firebase config and set ENABLE_MULTIPLAYER = true.", "bad");
}

currentRoom = {
  fen: chess.fen(),
  players: { white: null, black: null },
  moves: [],
  result: ""
};
renderAll();

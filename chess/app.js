import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1/+esm";
import { ENABLE_MULTIPLAYER, firebaseConfig } from "./firebase-config.js";

let multiplayerReady = false;
let dbApi = null;
let db = null;

if (ENABLE_MULTIPLAYER) {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js");
  dbApi = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js");

  const app = initializeApp(firebaseConfig);
  db = dbApi.getDatabase(app);
  multiplayerReady = true;
}

const boardEl = document.getElementById("board");
const topClockEl = document.getElementById("topClock");
const bottomClockEl = document.getElementById("bottomClock");
const opponentNameEl = document.getElementById("opponentName");
const opponentColorEl = document.getElementById("opponentColor");
const selfNameEl = document.getElementById("selfName");
const selfColorEl = document.getElementById("selfColor");
const gameStatusEl = document.getElementById("gameStatus");
const connectionStatusEl = document.getElementById("connectionStatus");
const roomCodeEl = document.getElementById("roomCode");
const roomInputEl = document.getElementById("roomInput");
const whiteCapturedEl = document.getElementById("whiteCaptured");
const blackCapturedEl = document.getElementById("blackCaptured");
const moveListEl = document.getElementById("moveList");
const promotionPopoverEl = document.getElementById("promotionPopover");
const promotionPiecesEl = document.getElementById("promotionPieces");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const flipBtn = document.getElementById("flipBtn");
const newLocalBtn = document.getElementById("newLocalBtn");

const PIECES = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" }
};

const PIECE_VALUE = { q: 9, r: 5, b: 3, n: 3, p: 1 };
const STARTING_TIME_MS = 5 * 60 * 1000;

let chess = new Chess();
let roomId = "";
let currentRoom = null;
let myColor = null;
let orientation = "w";
let selectedSquare = null;
let legalTargets = [];
let pendingPromotion = null;
let unsubscribeRoom = null;
let clockInterval = null;

const clientId = getClientId();
const clientName = getClientName();

function getClientId() {
  const key = "woodboard-chess-client-id";
  let saved = localStorage.getItem(key);
  if (!saved) {
    saved = `guest-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, saved);
  }
  return saved;
}

function getClientName() {
  const key = "woodboard-chess-client-name";
  let saved = localStorage.getItem(key);
  if (!saved) {
    saved = `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(key, saved);
  }
  return saved;
}

function setStatus(message, kind = "") {
  connectionStatusEl.className = `status-box ${kind}`;
  connectionStatusEl.textContent = message;
}

function randomRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function nowMs() {
  return Date.now();
}

function roomRef(code = roomId) {
  return dbApi.ref(db, `rooms/${code}`);
}

function presenceRef(code = roomId) {
  return dbApi.ref(db, `rooms/${code}/presence/${clientId}`);
}

function initialRoom(whiteId) {
  return {
    fen: new Chess().fen(),
    players: {
      white: whiteId,
      black: ""
    },
    names: {
      [whiteId]: clientName
    },
    clocks: {
      w: STARTING_TIME_MS,
      b: STARTING_TIME_MS,
      lastTick: nowMs(),
      running: true
    },
    moves: [],
    result: "",
    createdAt: nowMs(),
    updatedAt: nowMs()
  };
}

function localRoomState() {
  return {
    fen: chess.fen(),
    players: { white: "local-white", black: "local-black" },
    names: { "local-white": "White", "local-black": "Black" },
    clocks: { w: STARTING_TIME_MS, b: STARTING_TIME_MS, lastTick: nowMs(), running: true },
    moves: [],
    result: ""
  };
}

function colorName(color) {
  if (color === "w") return "White";
  if (color === "b") return "Black";
  return "Spectator";
}

function playerColorFromRoom(room) {
  if (!room?.players) return null;
  if (room.players.white === clientId) return "w";
  if (room.players.black === clientId) return "b";
  return "spectator";
}

function displayTime(ms) {
  const safe = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function liveClocks(room) {
  if (!room?.clocks) return { w: STARTING_TIME_MS, b: STARTING_TIME_MS };

  let w = Number(room.clocks.w ?? STARTING_TIME_MS);
  let b = Number(room.clocks.b ?? STARTING_TIME_MS);
  const running = room.clocks.running !== false && !room.result;
  const turn = new Chess(room.fen).turn();

  if (running) {
    const elapsed = Math.max(0, nowMs() - Number(room.clocks.lastTick || nowMs()));
    if (turn === "w") w -= elapsed;
    if (turn === "b") b -= elapsed;
  }

  return { w: Math.max(0, w), b: Math.max(0, b) };
}

function updateClockDisplay() {
  const room = currentRoom || localRoomState();
  const clocks = liveClocks(room);
  const topColor = orientation === "w" ? "b" : "w";
  const bottomColor = orientation === "w" ? "w" : "b";

  topClockEl.textContent = displayTime(clocks[topColor]);
  bottomClockEl.textContent = displayTime(clocks[bottomColor]);

  topClockEl.classList.toggle("active", chess.turn() === topColor && !chess.isGameOver());
  bottomClockEl.classList.toggle("active", chess.turn() === bottomColor && !chess.isGameOver());

  if (!room.result && (clocks.w <= 0 || clocks.b <= 0)) {
    gameStatusEl.textContent = clocks.w <= 0 ? "Black wins on time" : "White wins on time";
  }
}

function filesForOrientation() {
  return orientation === "w"
    ? ["a", "b", "c", "d", "e", "f", "g", "h"]
    : ["h", "g", "f", "e", "d", "c", "b", "a"];
}

function ranksForOrientation() {
  return orientation === "w"
    ? ["8", "7", "6", "5", "4", "3", "2", "1"]
    : ["1", "2", "3", "4", "5", "6", "7", "8"];
}

function squareAt(row, col) {
  const files = filesForOrientation();
  const ranks = ranksForOrientation();
  return `${files[col]}${ranks[row]}`;
}

function isLightSquare(square) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0) + 1;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 1;
}

function getLastMoveSquares() {
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
        const file = "abcdefgh"[col];
        const rank = String(8 - row);
        return `${file}${rank}`;
      }
    }
  }
  return null;
}

function renderBoard() {
  boardEl.innerHTML = "";
  const files = filesForOrientation();
  const ranks = ranksForOrientation();
  const lastMoveSquares = getLastMoveSquares();
  const checkSquare = chess.isCheck() ? findKingSquare(chess.turn()) : null;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = squareAt(row, col);
      const piece = chess.get(square);
      const squareEl = document.createElement("button");
      squareEl.type = "button";
      squareEl.className = `square ${isLightSquare(square) ? "light" : "dark"}`;
      squareEl.dataset.square = square;
      squareEl.setAttribute("aria-label", square);

      if (selectedSquare === square) squareEl.classList.add("selected");
      if (lastMoveSquares.includes(square)) squareEl.classList.add("last-move");

      if (legalTargets.includes(square)) {
        squareEl.classList.add(piece ? "capture" : "legal");
      }

      if (checkSquare === square) squareEl.classList.add("check");

      if (col === 0) {
        const rank = document.createElement("span");
        rank.className = "coord rank";
        rank.textContent = ranks[row];
        squareEl.append(rank);
      }

      if (row === 7) {
        const file = document.createElement("span");
        file.className = "coord file";
        file.textContent = files[col];
        squareEl.append(file);
      }

      if (piece) {
        const pieceEl = document.createElement("span");
        pieceEl.className = `piece ${piece.color === "w" ? "white" : "black"}`;
        pieceEl.textContent = PIECES[piece.color][piece.type];
        squareEl.append(pieceEl);
      }

      squareEl.addEventListener("click", () => handleSquareClick(square));
      boardEl.append(squareEl);
    }
  }
}

function renderSidePanel() {
  gameStatusEl.textContent = buildGameStatus();
  roomCodeEl.textContent = roomId || "—";

  const topColor = orientation === "w" ? "b" : "w";
  const bottomColor = orientation === "w" ? "w" : "b";
  const room = currentRoom;

  const playerIds = room?.players || {};
  const topId = topColor === "w" ? playerIds.white : playerIds.black;
  const bottomId = bottomColor === "w" ? playerIds.white : playerIds.black;

  opponentNameEl.textContent = topId ? (room?.names?.[topId] || "Opponent") : "Waiting...";
  selfNameEl.textContent = myColor === "spectator" ? "Spectator" : clientName;

  opponentColorEl.textContent = topColor === "w" ? "White" : "Black";
  selfColorEl.textContent =
    myColor === "spectator"
      ? "Spectating"
      : myColor
        ? `Playing as ${colorName(myColor)}`
        : "Local board";

  renderCaptured();
  renderMoveList();
  updateClockDisplay();
}

function buildGameStatus() {
  if (chess.isCheckmate()) return `${colorName(chess.turn() === "w" ? "b" : "w")} wins by checkmate`;
  if (chess.isStalemate()) return "Draw by stalemate";
  if (chess.isThreefoldRepetition()) return "Draw by threefold repetition";
  if (chess.isInsufficientMaterial()) return "Draw by insufficient material";
  if (chess.isDraw()) return "Draw";
  if (chess.isCheck()) return `${colorName(chess.turn())} is in check`;
  return `${colorName(chess.turn())} to move`;
}

function renderMoveList() {
  const moves = currentRoom?.moves || [];
  moveListEl.innerHTML = "";

  for (let i = 0; i < moves.length; i += 2) {
    const li = document.createElement("li");
    const number = document.createElement("span");
    number.className = "move-number";
    number.textContent = `${i / 2 + 1}.`;
    li.append(number, document.createTextNode(` ${moves[i]?.san || ""}`));
    if (moves[i + 1]) li.append(document.createTextNode(`   ${moves[i + 1].san}`));
    moveListEl.append(li);
  }

  moveListEl.scrollTop = moveListEl.scrollHeight;
}

function renderCaptured() {
  const capturedByWhite = [];
  const capturedByBlack = [];

  for (const move of currentRoom?.moves || []) {
    if (!move.captured) continue;
    if (move.color === "w") capturedByWhite.push(move.captured);
    if (move.color === "b") capturedByBlack.push(move.captured);
  }

  capturedByWhite.sort((a, b) => (PIECE_VALUE[b] || 0) - (PIECE_VALUE[a] || 0));
  capturedByBlack.sort((a, b) => (PIECE_VALUE[b] || 0) - (PIECE_VALUE[a] || 0));

  whiteCapturedEl.textContent = capturedByWhite.map(p => PIECES.b[p]).join("");
  blackCapturedEl.textContent = capturedByBlack.map(p => PIECES.w[p]).join("");
}

function rerender() {
  renderBoard();
  renderSidePanel();
}

function clearSelection() {
  selectedSquare = null;
  legalTargets = [];
}

function canMoveNow() {
  if (!multiplayerReady || !roomId) return true;
  if (!myColor || myColor === "spectator") return false;
  return chess.turn() === myColor;
}

function selectSquare(square) {
  const piece = chess.get(square);
  if (!piece) return;
  if (!canMoveNow()) return;
  if (piece.color !== chess.turn()) return;
  if (myColor && myColor !== "spectator" && piece.color !== myColor) return;

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
  promotionPiecesEl.innerHTML = "";

  const color = chess.get(from).color;
  for (const promotion of ["q", "r", "b", "n"]) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "promotion-piece";
    btn.textContent = PIECES[color][promotion];
    btn.addEventListener("click", async () => {
      promotionPopoverEl.classList.add("hidden");
      const request = pendingPromotion;
      pendingPromotion = null;
      await makeMove(request.from, request.to, promotion);
    });
    promotionPiecesEl.append(btn);
  }

  promotionPopoverEl.classList.remove("hidden");
}

async function handleSquareClick(square) {
  if (pendingPromotion) return;

  const clickedPiece = chess.get(square);

  if (!selectedSquare) {
    selectSquare(square);
    rerender();
    return;
  }

  if (selectedSquare === square) {
    clearSelection();
    rerender();
    return;
  }

  if (clickedPiece && clickedPiece.color === chess.turn() && canMoveNow()) {
    selectSquare(square);
    rerender();
    return;
  }

  if (!legalTargets.includes(square)) {
    clearSelection();
    rerender();
    return;
  }

  if (needsPromotion(selectedSquare, square)) {
    showPromotion(selectedSquare, square);
    return;
  }

  await makeMove(selectedSquare, square);
}

function calculateMoveClock(room, turnBefore) {
  const clocks = { ...(room.clocks || {}) };
  const elapsed = Math.max(0, nowMs() - Number(clocks.lastTick || nowMs()));
  const key = turnBefore === "w" ? "w" : "b";
  clocks[key] = Math.max(0, Number(clocks[key] ?? STARTING_TIME_MS) - elapsed);
  clocks.lastTick = nowMs();
  clocks.running = true;
  return clocks;
}

function applyMoveLocally(from, to, promotion = "q") {
  const temp = new Chess(chess.fen());
  const move = temp.move({ from, to, promotion });
  if (!move) return null;

  chess = temp;
  currentRoom = {
    ...(currentRoom || localRoomState()),
    fen: chess.fen(),
    moves: [
      ...(currentRoom?.moves || []),
      {
        color: move.color,
        from: move.from,
        to: move.to,
        san: move.san,
        piece: move.piece,
        captured: move.captured || "",
        promotion: move.promotion || ""
      }
    ]
  };

  return move;
}

async function makeMove(from, to, promotion = "q") {
  if (!canMoveNow()) {
    setStatus("It is not your turn.", "warn");
    clearSelection();
    rerender();
    return;
  }

  if (!multiplayerReady || !roomId) {
    const move = applyMoveLocally(from, to, promotion);
    clearSelection();
    if (!move) setStatus("Illegal move.", "warn");
    rerender();
    return;
  }

  await dbApi.runTransaction(roomRef(roomId), room => {
    if (!room || room.result) return room;

    const game = new Chess(room.fen);
    const activeColor = game.turn();

    if (activeColor !== myColor) return room;

    const move = game.move({ from, to, promotion });
    if (!move) return room;

    const clocks = calculateMoveClock(room, activeColor);
    const result =
      game.isCheckmate() ? `${activeColor === "w" ? "white" : "black"}_checkmated` :
      game.isDraw() ? "draw" :
      "";

    return {
      ...room,
      fen: game.fen(),
      clocks,
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
      updatedAt: nowMs()
    };
  });

  clearSelection();
}

async function createRoom() {
  if (!multiplayerReady) {
    setStatus("Multiplayer is off. Edit firebase-config.js and set ENABLE_MULTIPLAYER to true.", "warn");
    return;
  }

  const code = randomRoomCode();
  await joinOrCreateRoom(code);
  copyInviteLink(false);
}

async function joinOrCreateRoom(codeFromUser) {
  if (!multiplayerReady) {
    setStatus("Multiplayer is off. You can still test moves locally.", "warn");
    return;
  }

  const code = String(codeFromUser || roomInputEl.value || "").trim().toUpperCase();

  if (!code) {
    setStatus("Enter a room code first.", "warn");
    return;
  }

  await dbApi.runTransaction(roomRef(code), room => {
    if (!room) {
      return initialRoom(clientId);
    }

    const white = room.players?.white || "";
    const black = room.players?.black || "";

    if (white === clientId || black === clientId) {
      room.names = { ...(room.names || {}), [clientId]: clientName };
      return room;
    }

    if (!white) {
      room.players = { ...(room.players || {}), white: clientId };
      room.names = { ...(room.names || {}), [clientId]: clientName };
      return room;
    }

    if (!black) {
      room.players = { ...(room.players || {}), black: clientId };
      room.names = { ...(room.names || {}), [clientId]: clientName };
      return room;
    }

    room.names = { ...(room.names || {}), [clientId]: clientName };
    return room;
  });

  await dbApi.set(presenceRef(code), {
    id: clientId,
    name: clientName,
    joinedAt: nowMs(),
    lastSeen: nowMs()
  });

  try {
    dbApi.onDisconnect(presenceRef(code)).remove();
  } catch {
    // Public demo rules or local environment may block onDisconnect in some setups.
  }

  roomId = code;
  roomInputEl.value = code;
  location.hash = code;

  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = dbApi.onValue(roomRef(code), snap => {
    currentRoom = snap.val();
    if (!currentRoom) return;

    chess = new Chess(currentRoom.fen);
    myColor = playerColorFromRoom(currentRoom);

    if (myColor === "w" || myColor === "b") {
      orientation = myColor;
    }

    if (myColor === "spectator") {
      setStatus(`Opened ${code}. White and Black are taken, so you are spectating.`, "good");
    } else {
      setStatus(`Opened ${code}. You are ${colorName(myColor)}. No login needed.`, "good");
    }

    clearSelection();
    rerender();
  });
}

function copyInviteLink(showMessage = true) {
  const code = roomId || roomCodeEl.textContent;

  if (!code || code === "—") {
    setStatus("Create or join a room first.", "warn");
    return;
  }

  const url = `${location.origin}${location.pathname}#${code}`;
  navigator.clipboard?.writeText(url);

  if (showMessage) {
    setStatus(`Invite link copied. Anyone with the link can open and play.`, "good");
  }
}

function newLocalBoard() {
  if (unsubscribeRoom) unsubscribeRoom();

  roomId = "";
  currentRoom = localRoomState();
  chess = new Chess();
  myColor = null;
  orientation = "w";
  clearSelection();
  location.hash = "";

  setStatus(
    multiplayerReady
      ? "Local board reset. Create an invite link for multiplayer."
      : "Local demo. Add Firebase Realtime Database config for no-login multiplayer.",
    multiplayerReady ? "good" : "warn"
  );

  rerender();
}

createRoomBtn.addEventListener("click", createRoom);
joinRoomBtn.addEventListener("click", () => joinOrCreateRoom());
copyLinkBtn.addEventListener("click", () => copyInviteLink(true));
newLocalBtn.addEventListener("click", newLocalBoard);

roomInputEl.addEventListener("keydown", event => {
  if (event.key === "Enter") joinOrCreateRoom();
});

flipBtn.addEventListener("click", () => {
  orientation = orientation === "w" ? "b" : "w";
  rerender();
});

if (clockInterval) clearInterval(clockInterval);
clockInterval = setInterval(updateClockDisplay, 500);

currentRoom = localRoomState();

if (multiplayerReady) {
  setStatus("No-login multiplayer ready. Create an invite link or open a room link.", "good");
  const hashRoom = location.hash.replace("#", "").trim().toUpperCase();

  if (hashRoom) {
    joinOrCreateRoom(hashRoom);
  }
} else {
  setStatus("Local demo. Add Firebase Realtime Database config for no-login multiplayer.", "warn");
}

rerender();

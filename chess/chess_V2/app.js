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
    players: { white: whiteId, black: "" },
    names: { [whiteId]: clientName },
    clocks: { w: STARTING_TIME_MS, b: STARTING_TIME_MS, lastTick: nowMs(), running: true },
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

function getPalette(color) {
  return color === "w"
    ? { fill: "#f2f2ec", stroke: "#7a7a74", accent: "#ffffff", shade: "#d8d8d1" }
    : { fill: "#61615d", stroke: "#2a2a27", accent: "#8b8b85", shade: "#474743" };
}

function svgWrap(body, color) {
  const p = getPalette(color);
  return `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="grad-${color}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${p.accent}"/>
          <stop offset="28%" stop-color="${p.fill}"/>
          <stop offset="100%" stop-color="${p.shade}"/>
        </linearGradient>
      </defs>
      ${body.replaceAll("__FILL__", `url(#grad-${color})`).replaceAll("__STROKE__", p.stroke)}
    </svg>
  `;
}

function pieceSVG(type, color) {
  const bodies = {
    p: `
      <g class="piece-outline" fill="__FILL__" stroke="__STROKE__">
        <circle cx="50" cy="25" r="10"/>
        <path d="M40 37 C40 32, 60 32, 60 37 L58 44 C56 50, 58 57, 62 63 L38 63 C42 57, 44 50, 42 44 Z"/>
        <path d="M35 63 L65 63 L69 72 L31 72 Z"/>
        <path d="M28 72 L72 72 L74 80 L26 80 Z"/>
        <path d="M24 80 L76 80 L76 86 L24 86 Z"/>
      </g>`,
    r: `
      <g class="piece-outline" fill="__FILL__" stroke="__STROKE__">
        <path d="M26 16 L34 16 L34 24 L42 24 L42 16 L58 16 L58 24 L66 24 L66 16 L74 16 L72 31 L28 31 Z"/>
        <path d="M31 31 L69 31 L64 43 L36 43 Z"/>
        <path d="M38 43 L62 43 L62 67 L38 67 Z"/>
        <path d="M33 67 L67 67 L70 76 L30 76 Z"/>
        <path d="M28 76 L72 76 L74 85 L26 85 Z"/>
      </g>`,
    n: `
      <g class="piece-outline" fill="__FILL__" stroke="__STROKE__">
        <path d="M64 22 C57 17, 44 19, 38 28 C33 35, 35 43, 29 50 C25 55, 24 61, 27 66 C31 72, 39 74, 45 72 L53 68 L60 69 C68 70, 73 68, 75 62 C77 56, 75 49, 70 45 L61 38 L64 31 L68 33 L71 26 Z"/>
        <circle cx="54" cy="29" r="2.4" fill="__STROKE__" stroke="none"/>
        <path d="M34 73 L67 73 L71 80 L30 80 Z"/>
        <path d="M27 80 L73 80 L74 86 L26 86 Z"/>
      </g>`,
    b: `
      <g class="piece-outline" fill="__FILL__" stroke="__STROKE__">
        <path d="M50 15 L58 26 L53 35 L60 44 C64 49, 64 57, 58 62 L42 62 C36 57, 36 49, 40 44 L47 35 L42 26 Z"/>
        <path d="M48 20 L53 30" fill="none"/>
        <path d="M37 62 L63 62 L67 72 L33 72 Z"/>
        <path d="M31 72 L69 72 L72 80 L28 80 Z"/>
        <path d="M26 80 L74 80 L74 86 L26 86 Z"/>
      </g>`,
    q: `
      <g class="piece-outline" fill="__FILL__" stroke="__STROKE__">
        <circle cx="31" cy="20" r="4"/>
        <circle cx="43" cy="15" r="4"/>
        <circle cx="57" cy="15" r="4"/>
        <circle cx="69" cy="20" r="4"/>
        <path d="M31 24 L37 40 L45 27 L50 42 L55 27 L63 40 L69 24 L65 58 L35 58 Z"/>
        <path d="M38 58 L62 58 L66 69 L34 69 Z"/>
        <path d="M31 69 L69 69 L72 79 L28 79 Z"/>
        <path d="M26 79 L74 79 L74 86 L26 86 Z"/>
      </g>`,
    k: `
      <g class="piece-outline" fill="__FILL__" stroke="__STROKE__">
        <path d="M50 10 L50 22" fill="none"/>
        <path d="M44 16 L56 16" fill="none"/>
        <path d="M43 24 L57 24 L60 34 L56 42 L60 48 C64 53, 64 59, 58 64 L42 64 C36 59, 36 53, 40 48 L44 42 L40 34 Z"/>
        <path d="M37 64 L63 64 L67 74 L33 74 Z"/>
        <path d="M31 74 L69 74 L72 82 L28 82 Z"/>
        <path d="M26 82 L74 82 L74 88 L26 88 Z"/>
      </g>`
  };

  return svgWrap(bodies[type], color);
}

function renderMiniPiece(type, color) {
  return `<span class="mini-piece">${pieceSVG(type, color)}</span>`;
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
      if (legalTargets.includes(square)) squareEl.classList.add(piece ? "capture" : "legal");
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
        pieceEl.className = "piece";
        pieceEl.innerHTML = pieceSVG(piece.type, piece.color);
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

  whiteCapturedEl.innerHTML = capturedByWhite.map(p => renderMiniPiece(p, "b")).join("");
  blackCapturedEl.innerHTML = capturedByBlack.map(p => renderMiniPiece(p, "w")).join("");
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
    btn.innerHTML = pieceSVG(promotion, color);
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
      game.isDraw() ? "draw" : "";

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
    if (!room) return initialRoom(clientId);

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
  } catch {}

  roomId = code;
  roomInputEl.value = code;
  location.hash = code;

  if (unsubscribeRoom) unsubscribeRoom();

  unsubscribeRoom = dbApi.onValue(roomRef(code), snap => {
    currentRoom = snap.val();
    if (!currentRoom) return;

    chess = new Chess(currentRoom.fen);
    myColor = playerColorFromRoom(currentRoom);

    if (myColor === "w" || myColor === "b") orientation = myColor;

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
  if (hashRoom) joinOrCreateRoom(hashRoom);
} else {
  setStatus("Local demo. Add Firebase Realtime Database config for no-login multiplayer.", "warn");
}

rerender();

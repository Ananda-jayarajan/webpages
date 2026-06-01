import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1/+esm";
import { ENABLE_MULTIPLAYER, firebaseConfig } from "./firebase-config.js";

let dbApi = null;
let db = null;
let multiplayerReady = false;

const boardEl = document.getElementById("board");
const gameStatusEl = document.getElementById("gameStatus");
const moveListEl = document.getElementById("moveList");
const connectionStatusEl = document.getElementById("connectionStatus");
const usernameInputEl = document.getElementById("usernameInput");
const roomInputEl = document.getElementById("roomInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const currentRoomEl = document.getElementById("currentRoom");
const yourSideEl = document.getElementById("yourSide");
const whiteSeatEl = document.getElementById("whiteSeat");
const blackSeatEl = document.getElementById("blackSeat");
const whiteNameEl = document.getElementById("whiteName");
const blackNameEl = document.getElementById("blackName");
const whiteSubEl = document.getElementById("whiteSub");
const blackSubEl = document.getElementById("blackSub");
const promotionPopoverEl = document.getElementById("promotionPopover");
const promotionPiecesEl = document.getElementById("promotionPieces");

const PIECE_UNICODE = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟"
};

const ROOM_PATTERN = /^[A-Z]{3}\d{3}$/;

let chess = new Chess();
let currentRoomCode = "";
let currentRoomData = null;
let mySide = null;
let boardOrientation = "w";
let selectedSquare = null;
let legalTargets = [];
let pendingPromotion = null;
let unsubscribeRoom = null;

const clientId = getClientId();

initialize();

async function initialize() {
  usernameInputEl.value = localStorage.getItem("woodboard-username") || "";
  const hashCode = sanitizeRoomCode(location.hash.replace("#", ""));
  if (hashCode) {
    roomInputEl.value = hashCode;
    currentRoomEl.textContent = hashCode;
    currentRoomCode = hashCode;
  }

  roomInputEl.addEventListener("input", handleRoomInput);
  usernameInputEl.addEventListener("input", () => {
    localStorage.setItem("woodboard-username", usernameInputEl.value.trim());
  });
  joinRoomBtn.addEventListener("click", createOrJoinRoom);

  roomInputEl.addEventListener("keydown", event => {
    if (event.key === "Enter") createOrJoinRoom();
  });
  usernameInputEl.addEventListener("keydown", event => {
    if (event.key === "Enter") createOrJoinRoom();
  });

  await setupFirebase();
  renderEverything();
}

async function setupFirebase() {
  if (!ENABLE_MULTIPLAYER) {
    setStatus(
      "Multiplayer is OFF. Set ENABLE_MULTIPLAYER = true in firebase-config.js.",
      "warn"
    );
    return;
  }

  const configText = JSON.stringify(firebaseConfig);

  if (
    configText.includes("PASTE_") ||
    configText.includes("YOUR_REAL") ||
    !firebaseConfig.apiKey ||
    !firebaseConfig.databaseURL ||
    firebaseConfig.databaseURL.includes("PASTE_YOUR_PROJECT")
  ) {
    setStatus(
      "Firebase config is not filled in. Replace the placeholder values in firebase-config.js with your real Firebase web app config.",
      "bad"
    );
    multiplayerReady = false;
    return;
  }

  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js");
    dbApi = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js");

    const app = initializeApp(firebaseConfig);
    db = dbApi.getDatabase(app);

    await withTimeout(
      dbApi.get(dbApi.ref(db, ".info/connected")),
      8000,
      "Firebase did not respond. Check databaseURL and Realtime Database setup."
    );

    multiplayerReady = true;
    setStatus("Multiplayer ready. Enter username + room code, then click Create / Join Room.", "good");
  } catch (error) {
    setStatus(`Firebase setup failed: ${error.message}`, "bad");
    multiplayerReady = false;
  }
}

function getClientId() {
  const key = "woodboard-client-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `guest-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function sanitizeRoomCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

function handleRoomInput() {
  const code = sanitizeRoomCode(roomInputEl.value);
  roomInputEl.value = code;
  currentRoomCode = code;
  currentRoomEl.textContent = code || "—";
}

function cleanUsername() {
  return usernameInputEl.value.trim().replace(/\s+/g, " ").slice(0, 20);
}

function setStatus(message, type = "") {
  connectionStatusEl.className = `status-box ${type}`;
  connectionStatusEl.textContent = message;
}

function roomRef(code) {
  return dbApi.ref(db, `rooms/${code}`);
}

function initialRoom(username) {
  return {
    fen: new Chess().fen(),
    players: {
      white: clientId,
      black: ""
    },
    names: {
      [clientId]: username
    },
    moves: [],
    result: "",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    })
  ]);
}

async function createOrJoinRoom() {
  const username = cleanUsername();
  const code = sanitizeRoomCode(roomInputEl.value);

  roomInputEl.value = code;
  currentRoomCode = code;
  currentRoomEl.textContent = code || "—";

  if (!username) {
    setStatus("Enter a username first.", "warn");
    usernameInputEl.focus();
    return;
  }

  if (!ROOM_PATTERN.test(code)) {
    setStatus("Room code must be 3 capital letters + 3 numbers, like ABC123.", "warn");
    roomInputEl.focus();
    return;
  }

  localStorage.setItem("woodboard-username", username);
  location.hash = code;

  if (!multiplayerReady) {
    setStatus(
      `Current room is ${code}, but Firebase multiplayer is OFF. Set ENABLE_MULTIPLAYER = true in firebase-config.js.`,
      "bad"
    );
    return;
  }

  joinRoomBtn.disabled = true;
  joinRoomBtn.textContent = "Joining...";

  try {
    const ref = roomRef(code);

    const snapshot = await withTimeout(
      dbApi.get(ref),
      8000,
      "Firebase did not respond. Check databaseURL and Realtime Database rules."
    );

    const existingRoom = snapshot.val();

    if (!existingRoom) {
      const newRoom = initialRoom(username);

      await withTimeout(
        dbApi.set(ref, newRoom),
        8000,
        "Could not create room. Check Firebase Realtime Database rules."
      );

      listenToRoom(code);
      setStatus(`Room ${code} created. You are White. Tell your friend to enter ${code}.`, "good");
      return;
    }

    const room = existingRoom;
    room.players = room.players || { white: "", black: "" };
    room.names = room.names || {};
    room.names[clientId] = username;

    const white = room.players.white || "";
    const black = room.players.black || "";

    if (white === clientId || black === clientId) {
      await withTimeout(
        dbApi.update(ref, {
          names: room.names,
          updatedAt: Date.now()
        }),
        8000,
        "Could not reconnect to room."
      );

      listenToRoom(code);
      return;
    }

    if (!white) {
      room.players.white = clientId;
    } else if (!black) {
      room.players.black = clientId;
    } else {
      await withTimeout(
        dbApi.update(ref, {
          names: room.names,
          updatedAt: Date.now()
        }),
        8000,
        "Could not join as spectator."
      );

      listenToRoom(code);
      setStatus(`Room ${code} is full. You are spectating.`, "warn");
      return;
    }

    await withTimeout(
      dbApi.update(ref, {
        players: room.players,
        names: room.names,
        updatedAt: Date.now()
      }),
      8000,
      "Could not join room. Check Firebase Realtime Database rules."
    );

    listenToRoom(code);

  } catch (error) {
    let message = error.message || String(error);

    if (message.toLowerCase().includes("permission")) {
      message = "Firebase permission denied. Paste the public rules from firebase-rules.json into Realtime Database rules.";
    }

    setStatus(`Room ${code} failed: ${message}`, "bad");
  } finally {
    joinRoomBtn.disabled = false;
    joinRoomBtn.textContent = "Create / Join Room";
  }
}

function listenToRoom(code) {
  if (unsubscribeRoom) {
    unsubscribeRoom();
    unsubscribeRoom = null;
  }

  currentRoomCode = code;
  currentRoomEl.textContent = code;

  unsubscribeRoom = dbApi.onValue(
    roomRef(code),
    snapshot => {
      const room = snapshot.val();

      if (!room) {
        setStatus(`Room ${code} does not exist yet. Click Create / Join Room.`, "warn");
        return;
      }

      currentRoomData = room;
      chess = new Chess(room.fen);

      mySide = getMySide(room);
      if (mySide === "w" || mySide === "b") boardOrientation = mySide;

      selectedSquare = null;
      legalTargets = [];

      updateStatusAfterRoomSync(code, room);
      renderEverything();
    },
    error => {
      setStatus(`Room listener failed: ${error.message}`, "bad");
    }
  );
}

function updateStatusAfterRoomSync(code, room) {
  const whiteName = getSeatName(room, "white");
  const blackName = getSeatName(room, "black");

  if (mySide === "w" && !room.players?.black) {
    setStatus(`Room ${code} created. You are White. Send code ${code} to your friend.`, "good");
    return;
  }

  if (mySide === "w") {
    setStatus(`Room ${code} connected. You are White.`, "good");
    return;
  }

  if (mySide === "b") {
    setStatus(`Room ${code} connected. You are Black.`, "good");
    return;
  }

  if (room.players?.white && room.players?.black) {
    setStatus(`Room ${code} is full. You are watching ${whiteName} vs ${blackName}.`, "warn");
    return;
  }

  setStatus(`Room ${code} connected.`, "good");
}

function getMySide(room) {
  if (room?.players?.white === clientId) return "w";
  if (room?.players?.black === clientId) return "b";
  return "spectator";
}

function getSeatName(room, seat) {
  const id = room?.players?.[seat] || "";
  if (!id) return "Open";
  return room?.names?.[id] || (seat === "white" ? "White player" : "Black player");
}

function bothPlayersJoined(room) {
  return Boolean(room?.players?.white && room?.players?.black);
}

function filesForOrientation() {
  return boardOrientation === "w"
    ? ["a", "b", "c", "d", "e", "f", "g", "h"]
    : ["h", "g", "f", "e", "d", "c", "b", "a"];
}

function ranksForOrientation() {
  return boardOrientation === "w"
    ? ["8", "7", "6", "5", "4", "3", "2", "1"]
    : ["1", "2", "3", "4", "5", "6", "7", "8"];
}

function squareAt(row, col) {
  return `${filesForOrientation()[col]}${ranksForOrientation()[row]}`;
}

function isLightSquare(square) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0) + 1;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 1;
}

function getLastMoveSquares() {
  const moves = currentRoomData?.moves || [];
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

function piecePath(color, type) {
  return `assets/pieces/${color}${type}.png`;
}

function makePieceElement(type, color) {
  const code = `${color}${type}`;
  const holder = document.createElement("span");
  holder.className = "piece";

  const img = document.createElement("img");
  img.className = "piece-img";
  img.src = piecePath(color, type);
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
      squareEl.setAttribute("aria-label", square);

      if (selectedSquare === square) squareEl.classList.add("selected");
      if (lastMoveSquares.includes(square)) squareEl.classList.add("last-move");
      if (legalTargets.includes(square)) squareEl.classList.add(piece ? "capture" : "legal");
      if (checkSquare === square) squareEl.classList.add("check");

      if (col === 0) {
        const rankEl = document.createElement("span");
        rankEl.className = "coord rank";
        rankEl.textContent = ranks[row];
        squareEl.append(rankEl);
      }

      if (row === 7) {
        const fileEl = document.createElement("span");
        fileEl.className = "coord file";
        fileEl.textContent = files[col];
        squareEl.append(fileEl);
      }

      if (piece) squareEl.append(makePieceElement(piece.type, piece.color));

      squareEl.addEventListener("click", () => handleSquareClick(square));
      boardEl.append(squareEl);
    }
  }
}

function renderEverything() {
  renderBoard();
  renderPlayers();
  renderMoves();
  renderGameStatus();
}

function renderPlayers() {
  const room = currentRoomData;

  const whiteName = getSeatName(room, "white");
  const blackName = getSeatName(room, "black");

  whiteSeatEl.textContent = whiteName;
  blackSeatEl.textContent = blackName;

  whiteNameEl.textContent = whiteName === "Open" ? "White" : whiteName;
  blackNameEl.textContent = blackName === "Open" ? "Black" : blackName;

  whiteSubEl.textContent = room?.players?.white ? "White" : "Waiting";
  blackSubEl.textContent = room?.players?.black ? "Black" : "Waiting";

  if (mySide === "w") yourSideEl.textContent = "White";
  else if (mySide === "b") yourSideEl.textContent = "Black";
  else if (mySide === "spectator") yourSideEl.textContent = "Spectator";
  else yourSideEl.textContent = "Not joined";
}

function renderMoves() {
  const moves = currentRoomData?.moves || [];
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
}

function renderGameStatus() {
  const room = currentRoomData;

  if (!room) {
    gameStatusEl.textContent = "Enter a room to start";
    return;
  }

  if (!bothPlayersJoined(room)) {
    gameStatusEl.textContent = "Waiting for second player";
    return;
  }

  if (room.result === "white_checkmate") {
    gameStatusEl.textContent = "White wins by checkmate";
    return;
  }

  if (room.result === "black_checkmate") {
    gameStatusEl.textContent = "Black wins by checkmate";
    return;
  }

  if (room.result === "draw") {
    gameStatusEl.textContent = "Draw";
    return;
  }

  if (chess.isCheckmate()) {
    gameStatusEl.textContent = `${chess.turn() === "w" ? "Black" : "White"} wins by checkmate`;
    return;
  }

  if (chess.isDraw()) {
    gameStatusEl.textContent = "Draw";
    return;
  }

  if (chess.isCheck()) {
    gameStatusEl.textContent = `${chess.turn() === "w" ? "White" : "Black"} is in check`;
    return;
  }

  gameStatusEl.textContent = `${chess.turn() === "w" ? "White" : "Black"} to move`;
}

function canMove() {
  if (!multiplayerReady || !currentRoomCode || !currentRoomData) return false;
  if (!bothPlayersJoined(currentRoomData)) return false;
  if (currentRoomData.result) return false;
  if (mySide !== "w" && mySide !== "b") return false;
  return chess.turn() === mySide;
}

function selectSquare(square) {
  const piece = chess.get(square);
  if (!piece || !canMove()) return;
  if (piece.color !== mySide) return;

  selectedSquare = square;
  legalTargets = chess.moves({ square, verbose: true }).map(move => move.to);
}

async function handleSquareClick(square) {
  if (pendingPromotion) return;

  if (!selectedSquare) {
    selectSquare(square);
    renderBoard();
    return;
  }

  if (selectedSquare === square) {
    clearSelection();
    renderBoard();
    return;
  }

  const clickedPiece = chess.get(square);

  if (clickedPiece && clickedPiece.color === mySide) {
    selectSquare(square);
    renderBoard();
    return;
  }

  if (!legalTargets.includes(square)) {
    clearSelection();
    renderBoard();
    return;
  }

  if (moveNeedsPromotion(selectedSquare, square)) {
    showPromotion(selectedSquare, square);
    return;
  }

  await makeMove(selectedSquare, square);
}

function clearSelection() {
  selectedSquare = null;
  legalTargets = [];
}

function moveNeedsPromotion(from, to) {
  const piece = chess.get(from);
  if (!piece || piece.type !== "p") return false;
  return (piece.color === "w" && to.endsWith("8")) || (piece.color === "b" && to.endsWith("1"));
}

function showPromotion(from, to) {
  pendingPromotion = { from, to };
  promotionPiecesEl.innerHTML = "";

  const color = chess.get(from).color;

  for (const type of ["q", "r", "b", "n"]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "promotion-piece";
    button.append(makePieceElement(type, color));
    button.addEventListener("click", async () => {
      const request = pendingPromotion;
      pendingPromotion = null;
      promotionPopoverEl.classList.add("hidden");
      await makeMove(request.from, request.to, type);
    });
    promotionPiecesEl.append(button);
  }

  promotionPopoverEl.classList.remove("hidden");
}

async function makeMove(from, to, promotion = "q") {
  if (!canMove()) {
    setStatus("You cannot move yet. Make sure both players joined and it is your turn.", "warn");
    clearSelection();
    renderBoard();
    return;
  }

  try {
    await dbApi.runTransaction(roomRef(currentRoomCode), room => {
      if (!room || room.result) return room;
      if (!bothPlayersJoined(room)) return room;

      const side =
        room.players.white === clientId ? "w" :
        room.players.black === clientId ? "b" :
        "spectator";

      const game = new Chess(room.fen);

      if (side !== game.turn()) return room;

      const move = game.move({ from, to, promotion });
      if (!move) return room;

      let result = "";
      if (game.isCheckmate()) result = side === "w" ? "white_checkmate" : "black_checkmate";
      else if (game.isDraw()) result = "draw";

      return {
        ...room,
        fen: game.fen(),
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
  } catch (error) {
    setStatus(`Move failed: ${error.message}`, "bad");
  }

  clearSelection();
}

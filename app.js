let xName = '', oName = '', turn = 'X';
let board = Array(9).fill('');
let active = true, sX = 0, sO = 0, mode = 'pvp';
let timerInterval, seconds = 0;

const bd = document.getElementById('board'),
      tri = document.getElementById('turn-indicator'),
      rm = document.getElementById('result-message'),
      sx = document.getElementById('scoreX'),
      so = document.getElementById('scoreO'),
      mv = document.getElementById('sound-move'),
      wn = document.getElementById('sound-win'),
      dr = document.getElementById('sound-draw'),
      tg = document.getElementById('toggle-theme'),
      tm = document.getElementById('timer');

tg.addEventListener('change', () => document.body.classList.toggle('light'));

document.getElementById('pvP').onclick = () => {
  mode = 'pvp';
  document.getElementById('mode-screen').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');
};

document.getElementById('pvAI').onclick = () => {
  mode = 'pvai';
  document.getElementById('mode-screen').classList.add('hidden');
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('inputO').classList.add('hidden');
};

document.getElementById('btnStart').onclick = () => {
  const px = document.getElementById('playerX').value.trim();
  const po = document.getElementById('playerO').value.trim();
  if (!px || (mode === 'pvp' && !po)) return alert('Enter names');
  xName = px;
  oName = mode === 'pvai' ? 'Computer' : po;
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  startTimer();
  updateTurn();
  draw();
};

document.getElementById('btnNext').onclick = resetBoard;
document.getElementById('btnRestart').onclick = () => location.reload();
document.getElementById('btnResetRound').onclick = resetBoard;

function updateTurn() {
  tri.textContent = `${turn === 'X' ? xName : oName}'s Turn (${turn})`;
}

function draw() {
  bd.innerHTML = '';
  board.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'cell';
    d.dataset.i = i;
    if (c) {
      d.textContent = c;
      d.classList.add(c.toLowerCase());
    }
    d.onclick = () => clickCell(i);
    bd.appendChild(d);
  });
}

function clickCell(i) {
  if (board[i] || !active) return;
  makeMove(i, turn);
  if (mode === 'pvai' && active) aiMove();
}

function makeMove(i, p) {
  board[i] = p;
  mv.currentTime = 0;
  mv.play();
  draw();
  if (checkWin()) {
    active = false;
    stopTimer();
    const winner = turn === 'X' ? xName : oName;
    turn === 'X' ? sX++ : sO++;
    sx.textContent = `❌: ${sX}`;
    so.textContent = `⭕: ${sO}`;
    wn.play();
    end(`🎉 Congratulations ${winner}!`);
    confetti();
  } else if (board.every(v => v)) {
    active = false;
    stopTimer();
    dr.play();
    end("It's a draw!");
  } else {
    turn = turn === 'X' ? 'O' : 'X';
    updateTurn();
  }
}

function checkWin() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(r =>
    board[r[0]] &&
    board[r[0]] === board[r[1]] &&
    board[r[1]] === board[r[2]]
  );
}

function end(msg) {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');
  rm.textContent = msg;
}

function resetBoard() {
  board.fill('');
  active = true;
  turn = 'X';
  seconds = 0;
  updateTimerDisplay();
  startTimer();
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  updateTurn();
  draw();
}

function aiMove() {
  const best = bestMove();
  makeMove(best, 'O');
}

function bestMove() {
  const avail = board.map((v, i) => v ? '' : i).filter(v => v !== '');
  let bestScore = -Infinity, move;
  for (const i of avail) {
    board[i] = 'O';
    const score = minimax(board, false);
    board[i] = '';
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function minimax(b, isMax) {
  if (checkWin()) return isMax ? -10 : 10;
  if (b.every(v => v)) return 0;
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = isMax ? 'O' : 'X';
      const s = minimax(b, !isMax);
      b[i] = '';
      best = isMax ? Math.max(s, best) : Math.min(s, best);
    }
  }
  return best;
}

function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  tm.textContent = `${mins}:${secs}`;
}

function confetti() {
  window.confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.4 }
  });
}

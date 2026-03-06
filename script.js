// ============================================
// 數獨遊戲核心邏輯
// ============================================

const DIFFICULTY = {
    easy: 35,    // 挖空數量
    medium: 45,
    hard: 55
};

let board = [];        // 完整解答
let puzzle = [];        // 題目（挖空後）
let userBoard = [];    // 使用者輸入
let selectedCell = null;
let showCandidates = false;
let currentDifficulty = 'medium';
let timerInterval = null;
let seconds = 0;
let gameCompleted = false;

// --------------------------------------------
// 數獨生成演算法
// --------------------------------------------

/**
 * 檢查數字是否可以放在指定位置
 */
function isValid(board, row, col, num) {
    // 檢查行
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
    }
    // 檢查列
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) return false;
    }
    // 檢查 3x3 宮
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

/**
 * 使用回溯法生成完整數獨盤面
 */
function generateFullBoard() {
    const newBoard = Array(9).fill(null).map(() => Array(9).fill(0));
    fillBoard(newBoard);
    return newBoard;
}

function fillBoard(board) {
    const empty = findEmpty(board);
    if (!empty) return true;

    const [row, col] = empty;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of nums) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

function findEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return null;
}

/**
 * Fisher-Yates 洗牌算法
 */
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * 根據難度挖空生成題目
 */
function generatePuzzle(difficulty) {
    // 生成完整盤面
    board = generateFullBoard();

    // 複製作為題目
    puzzle = board.map(row => [...row]);

    // 隨機挖空
    const cells = shuffle([...Array(81).keys()]);
    const holes = DIFFICULTY[difficulty];

    for (let i = 0; i < holes && i < cells.length; i++) {
        const idx = cells[i];
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        puzzle[row][col] = 0;
    }

    // 初始化使用者盤面
    userBoard = puzzle.map(row => [...row]);
}

// --------------------------------------------
// 遊戲邏輯
// --------------------------------------------

/**
 * 計算候選數
 */
function getCandidates(board, row, col) {
    if (board[row][col] !== 0) return [];
    const candidates = [];
    for (let n = 1; n <= 9; n++) {
        if (isValid(board, row, col, n)) {
            candidates.push(n);
        }
    }
    return candidates;
}

/**
 * 檢查衝突並標記錯誤
 */
function validateBoard() {
    const errors = new Set();

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const num = userBoard[row][col];
            if (num === 0) continue;

            // 檢查是否與同行其他位置衝突
            for (let c = 0; c < 9; c++) {
                if (c !== col && userBoard[row][c] === num) {
                    errors.add(`${row},${col}`);
                    errors.add(`${row},${c}`);
                }
            }

            // 檢查是否與同列其他位置衝突
            for (let r = 0; r < 9; r++) {
                if (r !== row && userBoard[r][col] === num) {
                    errors.add(`${row},${col}`);
                    errors.add(`${r},${col}`);
                }
            }

            // 檢查是否與同宮其他位置衝突
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    if ((r !== row || c !== col) && userBoard[r][c] === num) {
                        errors.add(`${row},${col}`);
                        errors.add(`${r},${c}`);
                    }
                }
            }
        }
    }

    return errors;
}

/**
 * 檢查遊戲是否完成
 */
function checkWin() {
    // 檢查是否填滿
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] === 0) return false;
        }
    }

    // 檢查是否有錯誤
    const errors = validateBoard();
    return errors.size === 0;
}

// --------------------------------------------
// UI 渲染
// --------------------------------------------

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    const errors = validateBoard();

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const value = userBoard[row][col];
            const isFixed = puzzle[row][col] !== 0;

            if (value !== 0) {
                cell.textContent = value;
                if (isFixed) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.add('user-input');
                }
                if (errors.has(`${row},${col}`)) {
                    cell.classList.add('error');
                }
            } else if (showCandidates) {
                const candidates = getCandidates(userBoard, row, col);
                if (candidates.length > 0) {
                    const candidatesEl = document.createElement('div');
                    candidatesEl.className = 'candidates';
                    for (let n = 1; n <= 9; n++) {
                        const span = document.createElement('span');
                        span.textContent = candidates.includes(n) ? n : '';
                        candidatesEl.appendChild(span);
                    }
                    cell.appendChild(candidatesEl);
                }
            }

            // 高亮樣式
            if (selectedCell) {
                const [selRow, selCol] = selectedCell;

                // 選取的儲存格
                if (selRow === row && selCol === col) {
                    cell.classList.add('selected');
                }
                // 同行列宮
                else if (selRow === row || selCol === col ||
                    (Math.floor(selRow / 3) === Math.floor(row / 3) &&
                        Math.floor(selCol / 3) === Math.floor(col / 3))) {
                    cell.classList.add('related');
                }
                // 相同數字
                else if (value !== 0 && value === userBoard[selRow][selCol]) {
                    cell.classList.add('same-number');
                }
            }

            cell.addEventListener('click', () => selectCell(row, col));
            boardEl.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    if (gameCompleted) return;
    selectedCell = [row, col];
    renderBoard();
}

/**
 * 尋找並返回與指定位置及數字衝突的所有儲存格座標
 */
function findConflicts(row, col, num) {
    const conflicts = [];

    // 檢查行
    for (let c = 0; c < 9; c++) {
        if (c !== col && userBoard[row][c] === num) {
            conflicts.push([row, c]);
        }
    }

    // 檢查列
    for (let r = 0; r < 9; r++) {
        if (r !== row && userBoard[r][col] === num) {
            conflicts.push([r, col]);
        }
    }

    // 檢查 3x3 宮
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if ((r !== row || c !== col) && userBoard[r][c] === num) {
                conflicts.push([r, c]);
            }
        }
    }

    return conflicts;
}

function triggerConflictFlash(conflicts) {
    conflicts.forEach(([r, c]) => {
        const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (cell) {
            cell.classList.remove('conflict-flash');
            void cell.offsetWidth; // 強制重繪以重啟動畫
            cell.classList.add('conflict-flash');

            // 動畫結束後移除類別，以便下次觸發
            setTimeout(() => {
                cell.classList.remove('conflict-flash');
            }, 800);
        }
    });
}

function showStatus(msg, isError = true) {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? '#ff6b6b' : '#4ecdc4';

    if (window._statusTimeout) clearTimeout(window._statusTimeout);
    if (msg) {
        window._statusTimeout = setTimeout(() => {
            el.textContent = '';
        }, 3000);
    }
}

function inputNumber(num) {
    if (!selectedCell || gameCompleted) return;

    const [row, col] = selectedCell;

    // 固定數字不能修改
    if (puzzle[row][col] !== 0) return;

    if (num === 0) {
        // 清除輸入
        userBoard[row][col] = 0;
        showStatus('');
    } else {
        // 如果目前值已經是這個數字，則視為重複點擊，不做處理或清除（通常數獨點擊同數字可能是想取消）
        // 這裡我們維持原邏輯：填入數字

        // 檢查規則衝突
        const conflicts = findConflicts(row, col, num);
        if (conflicts.length > 0) {
            showStatus('⚠️ 違反數獨規則：該位置已存在相同的數字');
            triggerConflictFlash(conflicts);
            // 同時閃爍當前選中的格子提示衝突
            triggerConflictFlash([[row, col]]);
            return; // 遵守需求：不給填數字
        }

        userBoard[row][col] = num;
        showStatus('');
    }

    renderBoard();
    checkGameComplete();
}

function checkGameComplete() {
    if (checkWin()) {
        gameCompleted = true;
        stopTimer();
        document.getElementById('finalTime').textContent = formatTime(seconds);
        document.getElementById('modalOverlay').classList.add('show');
    }
}

// --------------------------------------------
// 計時器
// --------------------------------------------

function startTimer() {
    stopTimer();
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// --------------------------------------------
// 遊戲控制
// --------------------------------------------

function newGame() {
    gameCompleted = false;
    selectedCell = null;
    stopTimer();
    generatePuzzle(currentDifficulty);
    renderBoard();
    startTimer();
    document.getElementById('modalOverlay').classList.remove('show');
}

function resetGame() {
    gameCompleted = false;
    selectedCell = null;
    stopTimer();
    userBoard = puzzle.map(row => [...row]);
    renderBoard();
    startTimer();
    document.getElementById('modalOverlay').classList.remove('show');
}

function giveHint() {
    if (gameCompleted) return;

    // 找到一個錯誤的格子
    const errors = validateBoard();
    let targetCell = null;

    if (errors.size > 0) {
        // 有錯誤，提示錯誤的格子
        for (const error of errors) {
            const [row, col] = error.split(',').map(Number);
            if (puzzle[row][col] === 0) {
                targetCell = [row, col];
                break;
            }
        }
    }

    if (!targetCell) {
        // 沒有錯誤，找一個空的格子
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (puzzle[row][col] === 0 && userBoard[row][col] === 0) {
                    targetCell = [row, col];
                    break;
                }
            }
            if (targetCell) break;
        }
    }

    if (targetCell) {
        const [row, col] = targetCell;
        userBoard[row][col] = board[row][col];
        selectedCell = [row, col];
        renderBoard();
        checkGameComplete();
    }
}

function toggleCandidates() {
    showCandidates = !showCandidates;
    const btn = document.getElementById('candidatesBtn');
    btn.classList.toggle('active', showCandidates);
    renderBoard();
}

// --------------------------------------------
// 鍵盤控制
// --------------------------------------------

function handleKeydown(e) {
    if (gameCompleted) return;

    // 數字鍵 1-9
    if (e.key >= '1' && e.key <= '9') {
        inputNumber(parseInt(e.key));
        return;
    }

    // 刪除鍵
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        inputNumber(0);
        return;
    }

    // 方向鍵移動
    if (selectedCell) {
        let [row, col] = selectedCell;

        switch (e.key) {
            case 'ArrowUp':
                row = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                row = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                col = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                col = Math.min(8, col + 1);
                break;
            default:
                return;
        }

        e.preventDefault();
        selectCell(row, col);
    }
}

// --------------------------------------------
// 事件綁定
// --------------------------------------------

function init() {
    // 數字鍵盤
    document.getElementById('numberPad').addEventListener('click', (e) => {
        if (e.target.classList.contains('number-btn')) {
            const num = parseInt(e.target.dataset.num);
            inputNumber(num);
        }
    });

    // 控制按鈕
    document.getElementById('hintBtn').addEventListener('click', giveHint);
    document.getElementById('candidatesBtn').addEventListener('click', toggleCandidates);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.getElementById('playAgainBtn').addEventListener('click', newGame);

    // 難度選擇
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.level;
            newGame();
        });
    });

    // 鍵盤事件
    document.addEventListener('keydown', handleKeydown);

    // 開始遊戲
    newGame();
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', init);

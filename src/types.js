/**
 * 遊戲狀態類型定義
 */

/**
 * @typedef {Object} GameState
 * @property {number[][]} board - 完整解答盤面 (9x9)
 * @property {number[][]} puzzle - 題目盤面，挖空後 (9x9)
 * @property {number[][]} userBoard - 使用者輸入盤面 (9x9)
 * @property {string} currentDifficulty - 當前難度 ('easy' | 'medium' | 'hard')
 * @property {number} seconds - 遊戲已進行秒數
 * @property {null|[number, number]} selectedCell - 當前選取儲存格座標 [row, col]
 * @property {boolean} showCandidates - 是否顯示候選數
 * @property {boolean} gameCompleted - 遊戲是否已完成
 */

/**
 * @typedef {Object} SaveData
 * @property {number} version - 存檔版本號
 * @property {number} savedAt - 存檔時間戳
 * @property {string} difficulty - 難度
 * @property {number[][]} board - 完整解答
 * @property {number[][]} puzzle - 題目
 * @property {number[][]} userBoard - 使用者輸入
 * @property {number} seconds - 計時秒數
 * @property {boolean} showCandidates - 候選數顯示狀態
 */

/**
 * @typedef {Object} HistoryRecord
 * @property {string} id - 記錄 ID
 * @property {number} completedAt - 完成時間戳
 * @property {string} difficulty - 難度
 * @property {number} timeSeconds - 完成所需秒數
 * @property {boolean} wasCompleted - 是否完成
 */

/**
 * @typedef {'dark'|'light'} Theme
 */

export const STORAGE_KEYS = {
    SAVE: 'sudoku-save',
    HISTORY: 'sudoku-history',
    THEME: 'sudoku-theme'
};

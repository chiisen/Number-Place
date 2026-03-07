/**
 * 存儲管理器
 * 處理 localStorage 的讀寫操作
 */
import { STORAGE_KEYS } from './types.js';

export class StorageManager {
    /**
     * 儲存遊戲進度
     * @param {import('./types.js').SaveData} saveData 
     */
    static saveGame(saveData) {
        try {
            const data = {
                version: 1,
                savedAt: Date.now(),
                ...saveData
            };
            localStorage.setItem(STORAGE_KEYS.SAVE, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('存檔失敗:', e);
            return false;
        }
    }

    /**
     * 讀取遊戲進度
     * @returns {import('./types.js').SaveData|null}
     */
    static loadGame() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SAVE);
            if (!raw) return null;

            const data = JSON.parse(raw);
            
            if (!this.validateSaveData(data)) {
                console.warn('存檔資料格式錯誤');
                return null;
            }

            return {
                version: data.version,
                difficulty: data.difficulty,
                board: data.board,
                puzzle: data.puzzle,
                userBoard: data.userBoard,
                seconds: data.seconds,
                showCandidates: data.showCandidates
            };
        } catch (e) {
            console.error('讀檔失敗:', e);
            return null;
        }
    }

    /**
     * 驗證存檔資料結構
     * @param {any} data 
     * @returns {boolean}
     */
    static validateSaveData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.board || !data.puzzle || !data.userBoard) return false;
        if (!Array.isArray(data.board) || data.board.length !== 9) return false;
        return true;
    }

    /**
     * 檢查是否有存檔
     * @returns {boolean}
     */
    static hasSavedGame() {
        return localStorage.getItem(STORAGE_KEYS.SAVE) !== null;
    }

    /**
     * 刪除存檔
     */
    static deleteSavedGame() {
        localStorage.removeItem(STORAGE_KEYS.SAVE);
    }

    /**
     * 儲存主題偏好
     * @param {import('./types.js').Theme} theme 
     */
    static saveTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }

    /**
     * 讀取主題偏好
     * @returns {import('./types.js').Theme}
     */
    static loadTheme() {
        const theme = localStorage.getItem(STORAGE_KEYS.THEME);
        return theme === 'light' ? 'light' : 'dark';
    }

    /**
     * 新增遊戲歷史記錄
     * @param {import('./types.js').HistoryRecord} record 
     */
    static addHistoryRecord(record) {
        try {
            const history = this.getHistoryRecords();
            history.unshift(record);
            
            if (history.length > 50) {
                history.pop();
            }
            
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        } catch (e) {
            console.error('儲存歷史記錄失敗:', e);
        }
    }

    /**
     * 取得所有歷史記錄
     * @returns {import('./types.js').HistoryRecord[]}
     */
    static getHistoryRecords() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    /**
     * 清除所有歷史記錄
     */
    static clearHistory() {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }
}

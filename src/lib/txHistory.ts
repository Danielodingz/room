// Shared transaction history utility — persists to localStorage
// Used by room page (on send) and dashboard (to display history)

export interface TxRecord {
    txHash: string;
    from: string;       // display name of sender
    fromAddress: string;
    to: string;         // display name of recipient
    toAddress: string;
    amount: string;     // human-readable e.g. "1.5"
    symbol: string;     // e.g. "STRK"
    timestamp: number;  // Unix ms
    direction: "sent" | "received";
}

function storageKey(walletAddress: string) {
    return `room_tx_history_${walletAddress.toLowerCase()}`;
}

export function saveTx(walletAddress: string, record: TxRecord) {
    try {
        const key = storageKey(walletAddress);
        const existing: TxRecord[] = loadTxHistory(walletAddress);
        // Prevent duplicates by txHash
        if (!existing.find(t => t.txHash === record.txHash)) {
            const updated = [record, ...existing].slice(0, 100); // keep last 100
            localStorage.setItem(key, JSON.stringify(updated));
        }
    } catch (e) {
        console.error("Failed to save tx to localStorage:", e);
    }
}

export function loadTxHistory(walletAddress: string): TxRecord[] {
    try {
        const key = storageKey(walletAddress);
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

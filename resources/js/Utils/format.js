/**
 * Utilities for formatting dates, times, and currency in SINERGI.
 * Strictly adheres to Asia/Jakarta (WIB) timezone representation
 * without modifying original timestamp semantics.
 */

/**
 * Format a date string (YYYY-MM-DD or ISO timestamp) to localized Indonesian format.
 * Example: '2026-10-06' -> '6 Okt 2026' or '6 Oktober 2026'
 *
 * @param {string|Date} dateInput
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatIndonesianDate(dateInput, options = {}) {
    if (!dateInput) return '-';

    try {
        let date;
        if (typeof dateInput === 'string') {
            const trimmed = dateInput.trim();
            // If it's a plain YYYY-MM-DD date, treat as noon WIB to avoid any midnight timezone shifts
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                date = new Date(`${trimmed}T12:00:00+07:00`);
            } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
                // Space-separated SQL datetime without timezone (e.g. 2026-10-06 14:30:00)
                date = new Date(`${trimmed.replace(' ', 'T')}+07:00`);
            } else {
                date = new Date(trimmed);
            }
        } else {
            date = dateInput;
        }

        if (isNaN(date.getTime())) return String(dateInput);

        return new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: options.month || 'short',
            year: 'numeric',
            ...options,
        }).format(date);
    } catch {
        return String(dateInput);
    }
}

/**
 * Format a timestamp to Indonesian Date and Time with explicit WIB suffix.
 * Example: '2026-10-06T14:30:00Z' -> '6 Okt 2026, 21:30 WIB'
 *
 * @param {string|Date} dateInput
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatIndonesianDateTime(dateInput, options = {}) {
    if (!dateInput) return '-';

    try {
        let date;
        if (typeof dateInput === 'string') {
            const trimmed = dateInput.trim();
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
                date = new Date(`${trimmed.replace(' ', 'T')}+07:00`);
            } else {
                date = new Date(trimmed);
            }
        } else {
            date = dateInput;
        }

        if (isNaN(date.getTime())) return String(dateInput);

        const dateStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: options.month || 'short',
            year: 'numeric',
        }).format(date);

        const timeStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date).replace('.', ':');

        return `${dateStr}, ${timeStr} WIB`;
    } catch {
        return String(dateInput);
    }
}

/**
 * Format timestamp to 24-hour time with WIB suffix.
 * Example: '2026-10-06T14:30:00Z' -> '21:30 WIB'
 *
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatIndonesianTime(dateInput) {
    if (!dateInput) return '-';

    try {
        let date;
        if (typeof dateInput === 'string') {
            const trimmed = dateInput.trim();
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
                date = new Date(`${trimmed.replace(' ', 'T')}+07:00`);
            } else {
                date = new Date(trimmed);
            }
        } else {
            date = dateInput;
        }

        if (isNaN(date.getTime())) return String(dateInput);

        const timeStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date).replace('.', ':');

        return `${timeStr} WIB`;
    } catch {
        return String(dateInput);
    }
}

/**
 * Format currency into standard Indonesian Rupiah format.
 * Example: 1500000 -> 'Rp 1.500.000'
 *
 * @param {number|string} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
    const num = typeof amount === 'number' ? amount : Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num);
}

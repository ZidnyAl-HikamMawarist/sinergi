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
            // If it's a plain YYYY-MM-DD date, append local noon in WIB to prevent day-shifting
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                date = new Date(`${dateInput}T12:00:00+07:00`);
            } else {
                date = new Date(dateInput);
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
        const date = new Date(dateInput);
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
        const date = new Date(dateInput);
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
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount || 0);
}

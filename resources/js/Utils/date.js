/**
 * SINERGI Standardized Timezone & Date Formatting Utilities
 *
 * Ensures all user-facing date and time displays consistently respect
 * Asia/Jakarta (WIB) regardless of local client OS timezone configuration.
 */

export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

/**
 * Format a timestamp into localized Indonesian Date string (e.g., "12 Okt 2026")
 */
export function formatDate(dateString, options = {}) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', {
            timeZone: DEFAULT_TIMEZONE,
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            ...options,
        });
    } catch {
        return '-';
    }
}

/**
 * Format a timestamp into localized Indonesian Time string with WIB suffix (e.g., "14:30:00 WIB")
 */
export function formatTime(dateString, options = {}) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const formatted = date.toLocaleTimeString('id-ID', {
            timeZone: DEFAULT_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            ...options,
        });
        return `${formatted} WIB`;
    } catch {
        return '-';
    }
}

/**
 * Format full date and time string (e.g., "12 Okt 2026, 14:30 WIB")
 */
export function formatDateTime(dateString, options = {}) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const datePart = date.toLocaleDateString('id-ID', {
            timeZone: DEFAULT_TIMEZONE,
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        const timePart = date.toLocaleTimeString('id-ID', {
            timeZone: DEFAULT_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            ...options,
        });
        return `${datePart}, ${timePart} WIB`;
    } catch {
        return '-';
    }
}

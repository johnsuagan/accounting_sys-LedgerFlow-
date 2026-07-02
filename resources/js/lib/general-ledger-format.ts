export function formatLedgerAmount(value: string | number): string {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return '0.00';
    }

    return parsed.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function formatLedgerDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const [year, month, day] = value.split('-');

    return `${month}-${day}-${year}`;
}

export function formatBalanceDisplay(amount: string, side: string): string {
    return `${formatLedgerAmount(amount)} ${side}`;
}

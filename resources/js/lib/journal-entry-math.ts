import type { JournalEntryLine } from '@/types/journal-entry';

export interface JournalTotals {
    totalDebit: number;
    totalCredit: number;
    difference: number;
}

export function parseAmount(value: number | string | null | undefined): number {
    const parsed = Number(value ?? 0);

    return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateTotals(lines: JournalEntryLine[]): JournalTotals {
    const totalDebit = lines.reduce((sum, line) => sum + parseAmount(line.debit), 0);
    const totalCredit = lines.reduce((sum, line) => sum + parseAmount(line.credit), 0);

    return {
        totalDebit,
        totalCredit,
        difference: totalDebit - totalCredit,
    };
}

export function isBalanced(totals: JournalTotals): boolean {
    return Math.abs(totals.difference) < 0.0001 && totals.totalDebit > 0;
}

export function lineHasDebitAndCredit(line: JournalEntryLine): boolean {
    const debit = parseAmount(line.debit);
    const credit = parseAmount(line.credit);

    return debit > 0 && credit > 0;
}

export function lineIsEmpty(line: JournalEntryLine): boolean {
    return parseAmount(line.debit) === 0 && parseAmount(line.credit) === 0 && !line.account_id;
}

export function allLinesHaveAccounts(lines: JournalEntryLine[]): boolean {
    return lines.every((line) => line.account_id !== null && line.account_id > 0);
}

export function canPost(lines: JournalEntryLine[]): boolean {
    if (lines.length < 2) {
        return false;
    }

    if (!allLinesHaveAccounts(lines)) {
        return false;
    }

    if (lines.some(lineHasDebitAndCredit)) {
        return false;
    }

    if (lines.some((line) => parseAmount(line.debit) < 0 || parseAmount(line.credit) < 0)) {
        return false;
    }

    const totals = calculateTotals(lines);

    return isBalanced(totals);
}

export type BalanceState = 'balanced' | 'unbalanced' | 'invalid';

export function balanceState(lines: JournalEntryLine[]): BalanceState {
    if (lines.some(lineHasDebitAndCredit)) {
        return 'invalid';
    }

    if (lines.some((line) => parseAmount(line.debit) < 0 || parseAmount(line.credit) < 0)) {
        return 'invalid';
    }

    const totals = calculateTotals(lines);

    if (isBalanced(totals) && lines.length >= 2) {
        return 'balanced';
    }

    if (totals.totalDebit === 0 && totals.totalCredit === 0 && lines.every(lineIsEmpty)) {
        return 'unbalanced';
    }

    return 'unbalanced';
}

export function formatCurrency(amount: number): string {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function displayEntryNumber(entryNumber: string | null, status: string): string {
    if (status === 'draft' || !entryNumber) {
        return 'Draft';
    }

    return entryNumber;
}

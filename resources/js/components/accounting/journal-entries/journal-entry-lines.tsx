import { JournalEntryLineRow, type JournalLineField } from '@/components/accounting/journal-entries/journal-entry-line-row';
import { Button } from '@/components/ui/button';
import type { PostableAccount } from '@/types/journal-entry';
import { Plus } from 'lucide-react';

interface JournalEntryLinesProps {
    lines: JournalLineField[];
    accounts: PostableAccount[];
    readOnly?: boolean;
    onChange: (lines: JournalLineField[]) => void;
}

function createEmptyLine(lineNumber: number): JournalLineField {
    return {
        account_id: null,
        line_number: lineNumber,
        description: '',
        debit: 0,
        credit: 0,
    };
}

export function JournalEntryLines({ lines, accounts, readOnly = false, onChange }: JournalEntryLinesProps) {
    const updateLine = (index: number, field: Partial<JournalLineField>) => {
        const nextLines = lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...field } : line));
        onChange(nextLines);
    };

    const addLine = () => {
        onChange([...lines, createEmptyLine(lines.length + 1)]);
    };

    const removeLine = (index: number) => {
        const nextLines = lines
            .filter((_, lineIndex) => lineIndex !== index)
            .map((line, lineIndex) => ({ ...line, line_number: lineIndex + 1 }));

        onChange(nextLines);
    };

    return (
        <div className="space-y-4">
            <div className="hidden gap-3 px-1 md:grid md:grid-cols-[minmax(220px,2fr)_minmax(180px,2fr)_120px_120px_48px]">
                <span className="text-muted-foreground text-xs font-medium uppercase">Account</span>
                <span className="text-muted-foreground text-xs font-medium uppercase">Description</span>
                <span className="text-muted-foreground text-xs font-medium uppercase">Debit</span>
                <span className="text-muted-foreground text-xs font-medium uppercase">Credit</span>
                <span />
            </div>

            <div className="space-y-3">
                {lines.map((line, index) => (
                    <JournalEntryLineRow
                        key={`${line.line_number}-${index}`}
                        line={line}
                        index={index}
                        accounts={accounts}
                        readOnly={readOnly}
                        canRemove={lines.length > 1}
                        onChange={updateLine}
                        onRemove={removeLine}
                    />
                ))}
            </div>

            {!readOnly && (
                <Button type="button" variant="outline" onClick={addLine}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add line
                </Button>
            )}
        </div>
    );
}

export { createEmptyLine };

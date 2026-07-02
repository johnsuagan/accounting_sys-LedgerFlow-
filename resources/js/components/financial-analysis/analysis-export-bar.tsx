import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Printer } from 'lucide-react';

interface AnalysisExportBarProps {
    filename?: string;
    csvData?: string[][];
    disabled?: boolean;
}

function downloadCsv(filename: string, rows: string[][]): void {
    const content = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export function AnalysisExportBar({ filename = 'financial-analysis', csvData, disabled = false }: AnalysisExportBarProps) {
    const handlePrint = () => window.print();
    const handlePdf = () => window.print();
    const handleExcel = () => {
        if (csvData && csvData.length > 0) {
            downloadCsv(`${filename}.csv`, csvData);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 print:hidden">
            <Button type="button" variant="outline" size="sm" onClick={handlePrint} disabled={disabled}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handlePdf} disabled={disabled} title="Use print dialog to save as PDF">
                <FileText className="mr-2 h-4 w-4" />
                PDF
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExcel}
                disabled={disabled || !csvData?.length}
                title={csvData?.length ? 'Download Excel-compatible CSV' : 'No tabular data to export'}
            >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
            </Button>
        </div>
    );
}

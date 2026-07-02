import type { JournalEntryAttachment } from '@/types/journal-entry';

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentListProps {
    attachments: JournalEntryAttachment[];
    readOnly?: boolean;
    onDelete?: (attachmentId: number) => void;
}

export function AttachmentList({ attachments, readOnly = false, onDelete }: AttachmentListProps) {
    if (attachments.length === 0) {
        return <p className="text-muted-foreground text-sm">No attachments.</p>;
    }

    return (
        <ul className="divide-y rounded-lg border">
            {attachments.map((attachment) => (
                <li key={attachment.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-medium">{attachment.file_name}</p>
                        <p className="text-muted-foreground text-sm">
                            {formatFileSize(attachment.file_size)} · {attachment.mime_type}
                            {attachment.uploaded_by_name ? ` · ${attachment.uploaded_by_name}` : ''}
                        </p>
                    </div>
                    {!readOnly && onDelete && (
                        <button
                            type="button"
                            className="text-destructive text-sm font-medium hover:underline"
                            onClick={() => onDelete(attachment.id)}
                        >
                            Delete
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
}

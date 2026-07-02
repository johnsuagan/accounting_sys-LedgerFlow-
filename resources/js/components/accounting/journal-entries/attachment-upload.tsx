import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

interface AttachmentUploadProps {
    entryId: number;
    disabled?: boolean;
}

export function AttachmentUpload({ entryId, disabled = false }: AttachmentUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        router.post(route('accounting.journal-entries.attachments.store', entryId), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setUploading(false);
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        });
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={`attachment-upload-${entryId}`}>Upload attachment</Label>
            <Input
                ref={inputRef}
                id={`attachment-upload-${entryId}`}
                type="file"
                disabled={disabled || uploading}
                onChange={handleUpload}
                className="max-w-md"
            />
            <p className="text-muted-foreground text-xs">
                {uploading ? 'Uploading...' : 'Maximum file size: 10 MB. Draft entries only.'}
            </p>
        </div>
    );
}

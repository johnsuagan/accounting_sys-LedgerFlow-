<?php

namespace App\Http\Controllers;

use App\Exceptions\Accounting\JournalEntryException;
use App\Http\Requests\JournalEntryAttachment\StoreJournalEntryAttachmentRequest;
use App\Models\JournalEntry;
use App\Models\JournalEntryAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class JournalEntryAttachmentController extends Controller
{
    public function store(
        StoreJournalEntryAttachmentRequest $request,
        JournalEntry $journalEntry,
    ): RedirectResponse {
        try {
            $file = $request->file('file');

            if ($file === null) {
                return back()->withErrors(['file' => 'A file is required.']);
            }

            $disk = (string) config('filesystems.default', 'local');
            $directory = sprintf(
                'journal-entries/%d/fy-%d/%d',
                $journalEntry->company_id,
                $journalEntry->fiscal_year_id,
                $journalEntry->id,
            );

            $storedFilename = Str::uuid()->toString().'_'.$file->getClientOriginalName();
            $storedPath = $file->storeAs($directory, $storedFilename, $disk);

            if ($storedPath === false) {
                return back()->withErrors(['file' => 'Unable to store the uploaded file.']);
            }

            JournalEntryAttachment::query()->create([
                'company_id' => $journalEntry->company_id,
                'journal_entry_id' => $journalEntry->id,
                'original_filename' => $file->getClientOriginalName(),
                'stored_path' => $storedPath,
                'mime_type' => $file->getClientMimeType() ?? 'application/octet-stream',
                'file_size' => $file->getSize(),
                'disk' => $disk,
                'uploaded_by' => $request->user()?->id,
            ]);
        } catch (JournalEntryException $exception) {
            return back()->withErrors(['journal_entry' => $exception->getMessage()]);
        }

        return back()->with('success', 'Attachment uploaded.');
    }

    public function destroy(JournalEntry $journalEntry, JournalEntryAttachment $attachment): RedirectResponse
    {
        $this->authorize('delete', $attachment);

        if ($attachment->journal_entry_id !== $journalEntry->id) {
            abort(404);
        }

        $disk = $attachment->disk ?: (string) config('filesystems.default', 'local');

        if (Storage::disk($disk)->exists($attachment->stored_path)) {
            Storage::disk($disk)->delete($attachment->stored_path);
        }

        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
    }
}

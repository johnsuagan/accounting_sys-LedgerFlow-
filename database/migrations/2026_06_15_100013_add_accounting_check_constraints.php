<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('
            ALTER TABLE journal_entries
            ADD CONSTRAINT chk_journal_entries_balanced_posted
            CHECK (
                status <> "posted"
                OR (total_debit = total_credit AND total_debit > 0)
            )
        ');

        DB::unprepared('
            ALTER TABLE journal_entry_lines
            ADD CONSTRAINT chk_journal_entry_lines_amounts
            CHECK (
                debit >= 0
                AND credit >= 0
                AND NOT (debit > 0 AND credit > 0)
                AND (debit > 0 OR credit > 0)
            )
        ');
    }

    public function down(): void
    {
        DB::unprepared('ALTER TABLE journal_entry_lines DROP CHECK chk_journal_entry_lines_amounts');
        DB::unprepared('ALTER TABLE journal_entries DROP CHECK chk_journal_entries_balanced_posted');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->dropCheckConstraint('journal_entry_lines', 'chk_journal_entry_lines_amounts');
        $this->dropCheckConstraint('journal_entries', 'chk_journal_entries_balanced_posted');

        $this->addCheckConstraint(
            'journal_entries',
            'chk_journal_entries_balanced_when_finalized',
            'status NOT IN ("posted", "reversed") OR (total_debit = total_credit AND total_debit > 0)'
        );

        $this->addCheckConstraint(
            'journal_entries',
            'chk_journal_entries_cancellation_fields',
            '(status = "cancelled" AND cancelled_at IS NOT NULL) OR (status <> "cancelled" AND cancelled_at IS NULL)'
        );

        $this->addCheckConstraint(
            'journal_entry_lines',
            'chk_journal_entry_lines_non_negative',
            'debit >= 0 AND credit >= 0'
        );
    }

    public function down(): void
    {
        $this->dropCheckConstraint('journal_entry_lines', 'chk_journal_entry_lines_non_negative');
        $this->dropCheckConstraint('journal_entries', 'chk_journal_entries_cancellation_fields');
        $this->dropCheckConstraint('journal_entries', 'chk_journal_entries_balanced_when_finalized');

        $this->addCheckConstraint(
            'journal_entries',
            'chk_journal_entries_balanced_posted',
            'status <> "posted" OR (total_debit = total_credit AND total_debit > 0)'
        );

        $this->addCheckConstraint(
            'journal_entry_lines',
            'chk_journal_entry_lines_amounts',
            'debit >= 0 AND credit >= 0 AND NOT (debit > 0 AND credit > 0) AND (debit > 0 OR credit > 0)'
        );
    }

    private function dropCheckConstraint(string $table, string $name): void
    {
        if ($this->checkConstraintExists($table, $name)) {
            DB::unprepared("ALTER TABLE {$table} DROP CHECK {$name}");
        }
    }

    private function addCheckConstraint(string $table, string $name, string $expression): void
    {
        if (! $this->checkConstraintExists($table, $name)) {
            DB::unprepared("ALTER TABLE {$table} ADD CONSTRAINT {$name} CHECK ({$expression})");
        }
    }

    private function checkConstraintExists(string $table, string $name): bool
    {
        $result = DB::selectOne(
            'SELECT 1 AS found FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND CONSTRAINT_NAME = ?
               AND CONSTRAINT_TYPE = ?',
            [$table, $name, 'CHECK']
        );

        return $result !== null;
    }
};

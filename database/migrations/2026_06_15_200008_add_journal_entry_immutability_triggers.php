<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entries_immutable_before_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entries_immutable_before_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entry_lines_immutable_before_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entry_lines_immutable_before_delete');

        DB::unprepared('
            CREATE TRIGGER trg_journal_entries_immutable_before_update
            BEFORE UPDATE ON journal_entries
            FOR EACH ROW
            BEGIN
                IF OLD.status = "reversed" OR OLD.status = "cancelled" THEN
                    SIGNAL SQLSTATE "45000"
                        SET MESSAGE_TEXT = "Reversed and cancelled journal entries are immutable.";
                END IF;

                IF OLD.status = "posted" THEN
                    IF NOT (
                        NEW.status = "reversed"
                        AND NEW.reversed_by_id IS NOT NULL
                        AND NEW.company_id <=> OLD.company_id
                        AND NEW.fiscal_year_id <=> OLD.fiscal_year_id
                        AND NEW.accounting_period_id <=> OLD.accounting_period_id
                        AND NEW.entry_number <=> OLD.entry_number
                        AND NEW.entry_date <=> OLD.entry_date
                        AND NEW.description <=> OLD.description
                        AND NEW.reference <=> OLD.reference
                        AND NEW.memo <=> OLD.memo
                        AND NEW.source <=> OLD.source
                        AND NEW.reversal_of_id <=> OLD.reversal_of_id
                        AND NEW.total_debit <=> OLD.total_debit
                        AND NEW.total_credit <=> OLD.total_credit
                        AND NEW.posted_at <=> OLD.posted_at
                        AND NEW.posted_by <=> OLD.posted_by
                        AND NEW.cancelled_at <=> OLD.cancelled_at
                        AND NEW.cancelled_by <=> OLD.cancelled_by
                        AND NEW.deleted_at <=> OLD.deleted_at
                    ) THEN
                        SIGNAL SQLSTATE "45000"
                            SET MESSAGE_TEXT = "Posted journal entries are immutable except for reversal metadata.";
                    END IF;
                END IF;
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_journal_entries_immutable_before_delete
            BEFORE DELETE ON journal_entries
            FOR EACH ROW
            BEGIN
                IF OLD.status IN ("posted", "reversed", "cancelled") THEN
                    SIGNAL SQLSTATE "45000"
                        SET MESSAGE_TEXT = "Posted, reversed, and cancelled journal entries cannot be deleted.";
                END IF;
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_journal_entry_lines_immutable_before_update
            BEFORE UPDATE ON journal_entry_lines
            FOR EACH ROW
            BEGIN
                DECLARE parent_status VARCHAR(20);

                SELECT status INTO parent_status
                FROM journal_entries
                WHERE id = OLD.journal_entry_id
                LIMIT 1;

                IF parent_status <> "draft" THEN
                    SIGNAL SQLSTATE "45000"
                        SET MESSAGE_TEXT = "Journal entry lines are immutable once the entry leaves draft status.";
                END IF;
            END
        ');

        DB::unprepared('
            CREATE TRIGGER trg_journal_entry_lines_immutable_before_delete
            BEFORE DELETE ON journal_entry_lines
            FOR EACH ROW
            BEGIN
                DECLARE parent_status VARCHAR(20);

                SELECT status INTO parent_status
                FROM journal_entries
                WHERE id = OLD.journal_entry_id
                LIMIT 1;

                IF parent_status <> "draft" THEN
                    SIGNAL SQLSTATE "45000"
                        SET MESSAGE_TEXT = "Journal entry lines cannot be deleted once the entry leaves draft status.";
                END IF;
            END
        ');
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entry_lines_immutable_before_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entry_lines_immutable_before_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entries_immutable_before_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_journal_entries_immutable_before_update');
    }
};

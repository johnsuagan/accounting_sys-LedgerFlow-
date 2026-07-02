<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->index(['company_id', 'status', 'entry_date'], 'journal_entries_company_status_date_idx');
        });

        Schema::table('journal_entry_lines', function (Blueprint $table) {
            $table->index('account_id', 'journal_entry_lines_account_id_idx');
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->index(['company_id', 'is_header', 'is_active'], 'accounts_company_posting_idx');
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropIndex('accounts_company_posting_idx');
        });

        Schema::table('journal_entry_lines', function (Blueprint $table) {
            $table->dropIndex('journal_entry_lines_account_id_idx');
        });

        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropIndex('journal_entries_company_status_date_idx');
        });
    }
};

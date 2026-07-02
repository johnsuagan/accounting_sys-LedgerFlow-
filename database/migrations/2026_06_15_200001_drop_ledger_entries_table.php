<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('ledger_entries');
    }

    public function down(): void
    {
        // Intentionally omitted. General Ledger is generated dynamically from posted journal_entry_lines.
    }
};

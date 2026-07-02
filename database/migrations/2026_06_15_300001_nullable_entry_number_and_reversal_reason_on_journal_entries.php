<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->string('entry_number', 30)->nullable()->change();
            $table->text('reversal_reason')->nullable()->after('reversed_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn('reversal_reason');
            $table->string('entry_number', 30)->nullable(false)->change();
        });
    }
};

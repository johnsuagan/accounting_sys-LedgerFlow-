<?php

use App\Enums\JournalEntrySource;
use App\Enums\JournalEntryStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fiscal_year_id')->constrained()->restrictOnDelete();
            $table->foreignId('accounting_period_id')->nullable()->constrained()->nullOnDelete();
            $table->string('entry_number', 30);
            $table->date('entry_date');
            $table->string('description');
            $table->string('reference', 100)->nullable();
            $table->text('memo')->nullable();
            $table->string('status', 20)->default(JournalEntryStatus::Draft->value);
            $table->string('source', 20)->default(JournalEntrySource::Manual->value);
            $table->foreignId('reversal_of_id')->nullable()->constrained('journal_entries')->nullOnDelete();
            $table->foreignId('reversed_by_id')->nullable()->constrained('journal_entries')->nullOnDelete();
            $table->decimal('total_debit', 18, 4)->default(0);
            $table->decimal('total_credit', 18, 4)->default(0);
            $table->timestamp('posted_at')->nullable();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'entry_number']);
            $table->index(['company_id', 'status']);
            $table->index(['company_id', 'entry_date']);
            $table->index(['company_id', 'fiscal_year_id']);
            $table->index(['company_id', 'accounting_period_id']);
            $table->index('reversal_of_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};

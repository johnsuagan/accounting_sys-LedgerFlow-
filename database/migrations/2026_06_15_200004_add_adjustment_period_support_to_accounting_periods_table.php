<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounting_periods', function (Blueprint $table) {
            $table->boolean('is_adjustment_period')->default(false)->after('period_number');
        });

        DB::unprepared('
            ALTER TABLE accounting_periods
            ADD CONSTRAINT chk_accounting_periods_period_number_range
            CHECK (period_number BETWEEN 1 AND 13)
        ');
    }

    public function down(): void
    {
        DB::unprepared('ALTER TABLE accounting_periods DROP CHECK chk_accounting_periods_period_number_range');

        Schema::table('accounting_periods', function (Blueprint $table) {
            $table->dropColumn('is_adjustment_period');
        });
    }
};

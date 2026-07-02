<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('company_user', 'company_users');
        Schema::rename('chart_of_accounts', 'accounts');
    }

    public function down(): void
    {
        Schema::rename('company_users', 'company_user');
        Schema::rename('accounts', 'chart_of_accounts');
    }
};

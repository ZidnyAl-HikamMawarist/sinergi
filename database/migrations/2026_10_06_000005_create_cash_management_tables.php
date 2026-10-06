<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cash_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['masuk', 'keluar']);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false); // e.g. Saldo Awal
            $table->timestamps();

            $table->unique(['type', 'name']);
        });

        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('cash_category_id')->constrained('cash_categories')->restrictOnDelete();
            $table->enum('type', ['masuk', 'keluar']);
            $table->unsignedBigInteger('amount'); // Nominal in Rupiah
            $table->string('description');
            $table->date('transaction_date');
            $table->string('proof_path'); // Mandatory receipt proof
            $table->string('proof_mime', 50)->nullable();
            $table->unsignedInteger('proof_size')->nullable();
            $table->enum('status', ['valid', 'void'])->default('valid')->index();
            $table->string('void_reason')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->dateTime('voided_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['academic_year_id', 'status', 'transaction_date'], 'cash_report_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
        Schema::dropIfExists('cash_categories');
    }
};

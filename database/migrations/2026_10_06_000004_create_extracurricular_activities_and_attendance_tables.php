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
        Schema::create('extracurricular_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('extracurricular_id')->constrained('extracurriculars')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->enum('position', ['ketua', 'wakil', 'anggota'])->default('anggota');
            $table->date('joined_at');
            $table->date('left_at')->nullable();
            $table->timestamps();

            $table->unique(['extracurricular_id', 'user_id', 'academic_year_id'], 'es_member_unique');
            $table->index(['user_id', 'academic_year_id']);
        });

        Schema::create('activity_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('extracurricular_id')->constrained('extracurriculars')->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->string('title');
            $table->date('session_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['draft', 'dibuka', 'ditutup'])->default('draft')->index();
            $table->dateTime('opened_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['extracurricular_id', 'session_date']);
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_session_id')->constrained('activity_sessions')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpa'])->index();
            $table->enum('method', ['qr', 'manual'])->default('qr');
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->string('note')->nullable(); // Wajib jika manual
            $table->dateTime('recorded_at');
            $table->timestamps();

            $table->unique(['activity_session_id', 'user_id']);
            $table->index(['user_id', 'recorded_at']);
        });

        Schema::create('qr_token_uses', function (Blueprint $table) {
            $table->id();
            $table->char('token_hash', 64)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('activity_session_id')->nullable()->constrained('activity_sessions')->nullOnDelete();
            $table->dateTime('used_at')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_token_uses');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('activity_sessions');
        Schema::dropIfExists('extracurricular_members');
    }
};

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
        Schema::create('osis_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('osis_sekbid_id')->constrained('osis_sekbids')->restrictOnDelete();
            $table->string('name');
            $table->text('description');
            $table->string('target_audience');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedBigInteger('estimated_budget')->default(0);
            $table->enum('status', ['draft', 'diajukan', 'disetujui', 'berjalan', 'terlaksana', 'dibatalkan'])->default('draft')->index();
            $table->foreignId('pic_user_id')->constrained('users')->restrictOnDelete();
            $table->text('approval_note')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['academic_year_id', 'osis_sekbid_id']);
            $table->index(['academic_year_id', 'status']);
        });

        Schema::create('osis_meetings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->foreignId('osis_sekbid_id')->nullable()->constrained('osis_sekbids')->nullOnDelete();
            $table->string('title');
            $table->enum('meeting_type', ['pleno', 'presidium', 'koordinasi_sekbid', 'evaluasi'])->default('pleno')->index();
            $table->date('meeting_date')->index();
            $table->string('start_time', 10);
            $table->string('end_time', 10)->nullable();
            $table->string('location')->default('Ruang OSIS');
            $table->text('agenda_description')->nullable();
            $table->enum('status', ['dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan'])->default('dijadwalkan')->index();
            $table->text('minutes_of_meeting')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['academic_year_id', 'meeting_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('osis_meetings');
        Schema::dropIfExists('osis_programs');
    }
};

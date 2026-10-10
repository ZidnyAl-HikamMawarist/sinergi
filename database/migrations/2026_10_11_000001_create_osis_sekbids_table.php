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
        Schema::create('osis_sekbids', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('number')->unique();
            $table->string('name');
            $table->string('short_title');
            $table->text('description');
            $table->json('official_duties');
            $table->json('coordinating_eskuls');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::table('role_user', function (Blueprint $table) {
            $table->foreignId('osis_sekbid_id')->nullable()->after('extracurricular_id')->constrained('osis_sekbids')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('role_user', function (Blueprint $table) {
            $table->dropForeign(['osis_sekbid_id']);
            $table->dropColumn('osis_sekbid_id');
        });

        Schema::dropIfExists('osis_sekbids');
    }
};

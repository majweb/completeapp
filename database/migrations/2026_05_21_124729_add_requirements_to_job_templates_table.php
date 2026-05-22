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
        Schema::table('job_templates', function (Blueprint $table) {
            $table->boolean('require_photo_before')->default(false)->after('structure');
            $table->boolean('require_photo_after')->default(false)->after('require_photo_before');
            $table->boolean('require_signature')->default(false)->after('require_photo_after');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_templates', function (Blueprint $table) {
            $table->dropColumn(['require_photo_before', 'require_photo_after', 'require_signature']);
        });
    }
};

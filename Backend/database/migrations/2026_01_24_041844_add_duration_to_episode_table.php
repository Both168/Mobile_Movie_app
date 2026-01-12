<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('episode', function (Blueprint $table) {
            if (!Schema::hasColumn('episode', 'duration')) {
                $table->integer('duration')->nullable()->after('video');
            }
        });
    }

    public function down(): void
    {
        Schema::table('episode', function (Blueprint $table) {
            $table->dropColumn('duration');
        });
    }
};

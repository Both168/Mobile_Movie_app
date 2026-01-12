<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::selectOne("SHOW INDEX FROM season WHERE Key_name = ?", ['idx_season_movie_id']);
        if (!$exists) {
            Schema::table('season', function (Blueprint $table) {
                $table->index('movie_id', 'idx_season_movie_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('season', function (Blueprint $table) {
            $table->dropIndex('idx_season_movie_id');
        });
    }
};

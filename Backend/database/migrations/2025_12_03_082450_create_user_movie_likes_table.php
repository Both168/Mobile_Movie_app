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
        Schema::create('user_movie_likes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_web_id');
            $table->unsignedBigInteger('movie_id');
            $table->timestamps();

            $table->unique(['user_web_id', 'movie_id']);
            // Note: Foreign keys commented out due to type mismatch, will handle in application logic
            // $table->foreign('user_web_id')
            //     ->references('id')
            //     ->on('user_web')
            //     ->onDelete('cascade');
            // $table->foreign('movie_id')
            //     ->references('id')
            //     ->on('movies')
            //     ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_movie_likes');
    }
};

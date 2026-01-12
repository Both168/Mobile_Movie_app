<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->integer('type')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->text('video')->nullable();
            $table->string('genre_id')->nullable();
            $table->integer('age_rating')->nullable();
            $table->string('language')->nullable();
            $table->integer('is_subtitles')->default(0);
            $table->integer('is_dubbed')->default(0);
            $table->integer('like')->unsigned()->nullable();
            $table->integer('view')->unsigned()->nullable();
            $table->integer('user_web_id')->nullable();
            $table->integer('status')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};

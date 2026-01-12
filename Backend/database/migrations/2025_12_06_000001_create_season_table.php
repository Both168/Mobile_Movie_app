<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('season', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->integer('number_of_season')->nullable();
            $table->integer('movie_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('season');
    }
};

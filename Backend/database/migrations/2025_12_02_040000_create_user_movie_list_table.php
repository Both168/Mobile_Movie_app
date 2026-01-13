<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_web_list', function (Blueprint $table) {
            $table->id();
            $table->integer('user_web_id')->nullable();
            $table->integer('movie_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_web_list');
    }
};

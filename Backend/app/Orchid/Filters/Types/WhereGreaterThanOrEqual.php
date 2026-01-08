<?php

declare(strict_types=1);

namespace App\Orchid\Filters\Types;

use Illuminate\Database\Eloquent\Builder;
use Orchid\Filters\BaseHttpEloquentFilter;

class WhereGreaterThanOrEqual extends BaseHttpEloquentFilter
{
    public function run(Builder $builder): Builder
    {
        $value = $this->getHttpValue();

        if (is_null($value) || $value === '') {
            return $builder;
        }

        return $builder->where($this->column, '>=', (int) $value);
    }
}


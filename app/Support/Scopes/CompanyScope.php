<?php

namespace App\Support\Scopes;

use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (CompanyContext::isScopeBypassed()) {
            return;
        }

        $companyId = CompanyContext::id();

        if ($companyId === null) {
            return;
        }

        $builder->where($model->getTable().'.company_id', $companyId);
    }
}

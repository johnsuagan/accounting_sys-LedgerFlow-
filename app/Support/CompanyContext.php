<?php

namespace App\Support;

class CompanyContext
{
    protected static ?int $companyId = null;

    protected static bool $bypassScope = false;

    public static function set(?int $companyId): void
    {
        static::$companyId = $companyId;
    }

    public static function id(): ?int
    {
        return static::$companyId;
    }

    public static function has(): bool
    {
        return static::$companyId !== null;
    }

    public static function clear(): void
    {
        static::$companyId = null;
        static::$bypassScope = false;
    }

    public static function bypassScope(bool $bypass = true): void
    {
        static::$bypassScope = $bypass;
    }

    public static function isScopeBypassed(): bool
    {
        return static::$bypassScope;
    }

    /**
     * @template TReturn
     *
     * @param  callable(): TReturn  $callback
     * @return TReturn
     */
    public static function withoutScope(callable $callback): mixed
    {
        $previousBypass = static::$bypassScope;

        static::$bypassScope = true;

        try {
            return $callback();
        } finally {
            static::$bypassScope = $previousBypass;
        }
    }
}

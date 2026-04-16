<?php

class JWTConfig {
    private static string $secret_key = "your-super-secret-jwt-key-change-this";
    public static string $issuer = "jobportal.com";
    private static int $expire_time = 3600;
    private static int $refresh_expire = 604800;

    public static function getSecretKey(): string {
        return self::$secret_key;
    }

    public static function getExpireTime(): int {
        return self::$expire_time;
    }

    public static function getRefreshExpire(): int {
        return self::$refresh_expire;
    }
}

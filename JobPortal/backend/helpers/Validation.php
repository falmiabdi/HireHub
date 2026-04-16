<?php

class Validation {
    public static function requireFields(array $data, array $fields): bool {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || $data[$field] === "") {
                return false;
            }
        }
        return true;
    }

    public static function validEmail(string $email): bool {
        return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
    }
}

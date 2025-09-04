<?php

session_start();

use Dotenv\Dotenv;
$projectRoot = dirname(__DIR__, 2);
if (file_exists($projectRoot . '/.env')) {
    $dotenv = Dotenv::createImmutable($projectRoot);
    $dotenv->load();
}
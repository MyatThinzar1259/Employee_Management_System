<?php

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/Core/Bootstrap.php';

use App\Core\Database;
use App\Core\Router;

// $router = new Router();
// $router->get('/', 'DashboardController@index');
// $router->get('/login', 'AuthController@loginForm');
// $router->post('/login', 'AuthController@login');
// $router->get('/logout', 'AuthController@logout');
$db = Database::getInstance()->getConnection();
print_r($db);
die("Database connected successfully.");
?>

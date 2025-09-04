<?php
namespace App\Core;

class Router
{
    protected static $routes = [];

    public static function get($uri, $action)
    {
        self::$routes['GET'][$uri] = $action;
    }

    public static function post($uri, $action)
    {
        self::$routes['POST'][$uri] = $action;
    }

    public static function dispatch($uri, $method)
    {
        $uri = parse_url($uri, PHP_URL_PATH);

        if (isset(self::$routes[$method][$uri])) {
            $action = self::$routes[$method][$uri];
            if (is_array($action)) {
                $controller = new $action[0]();
                $method = $action[1];
                return $controller->$method();
            } elseif (is_callable($action)) {
                return $action();
            }
        }

        http_response_code(404);
        echo "404 Not Found";
    }
}

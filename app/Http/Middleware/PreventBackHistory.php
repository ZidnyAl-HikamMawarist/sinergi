<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventBackHistory
{
    /**
     * Handle an incoming request.
     *
     * Ensure authenticated responses cannot be cached by browser back-forward cache (bfcache)
     * or intermediary proxies, preventing sensitive data exposure upon browser 'Back' after logout.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Apply strict anti-caching headers for authenticated sessions or requests on protected paths
        if ($request->user() || $request->is('portal/*', 'eskul/*', 'kas/*', 'admin/*', 'workspace/*', 'password/*')) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');
        }

        return $response;
    }
}

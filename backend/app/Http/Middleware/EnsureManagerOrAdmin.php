<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureManagerOrAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $role = strtolower($request->user()?->role ?? '');
        if (!in_array($role, ['manager', 'admin', 'administrator'])) {
            abort(403, 'Unauthorized. Manager or Admin access required.');
        }

        return $next($request);
    }
}

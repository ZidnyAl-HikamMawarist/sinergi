<?php

namespace App\Http\Controllers\Osis;

use App\Http\Controllers\Controller;
use App\Models\OsisSekbid;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OsisSekbidController extends Controller
{
    public function index(Request $request): Response
    {
        $sekbids = OsisSekbid::where('is_active', true)
            ->orderBy('number')
            ->get();

        return Inertia::render('Osis/Sekbid/Index', [
            'sekbids' => $sekbids,
        ]);
    }
}

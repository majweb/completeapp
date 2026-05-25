<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class GuideController extends Controller
{
    public function downloadPdf()
    {
        $pdf = Pdf::loadView('pdf.guide');

        return $pdf->stream('zlecenio_instrukcja.pdf');
    }
}

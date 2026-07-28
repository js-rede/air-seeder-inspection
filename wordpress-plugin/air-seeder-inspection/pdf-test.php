<?php

require_once dirname(__FILE__, 4) . '/wp-load.php';
require_once __DIR__ . '/lib/fpdf/fpdf.php';

if (!current_user_can('manage_options')) {
    wp_die('You do not have permission to access this page.');
}

$pdf = new FPDF('P', 'mm', 'Letter');
$pdf->SetMargins(15, 15, 15);
$pdf->SetAutoPageBreak(true, 15);
$pdf->AddPage();

$pdf->SetFont('Arial', 'B', 20);
$pdf->Cell(0, 10, 'Red E Inspection Estimate', 0, 1);

$pdf->SetFont('Arial', '', 11);
$pdf->Cell(0, 8, 'Basic PDF generation test', 0, 1);
$pdf->Ln(5);

$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(35, 8, 'Customer:');

$pdf->SetFont('Arial', '', 11);
$pdf->Cell(0, 8, 'Test Customer', 0, 1);

$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(35, 8, 'Machine:');

$pdf->SetFont('Arial', '', 11);
$pdf->Cell(0, 8, 'John Deere Air Seeder', 0, 1);

$pdf->SetFont('Arial', 'B', 11);
$pdf->Cell(35, 8, 'Date:');

$pdf->SetFont('Arial', '', 11);
$pdf->Cell(0, 8, wp_date('F j, Y'), 0, 1);

$pdf->Ln(8);

$pdf->SetFont('Arial', 'B', 11);
$pdf->SetFillColor(235, 235, 235);
$pdf->Cell(70, 10, 'Inspection Item', 1, 0, 'L', true);
$pdf->Cell(110, 10, 'Recommendation', 1, 1, 'L', true);

$pdf->SetFont('Arial', '', 10);
$pdf->Cell(70, 10, 'Main Arm Pivot', 1);
$pdf->Cell(110, 10, 'Inspect for excessive movement', 1, 1);

$pdf->Cell(70, 10, 'Disc Opener', 1);
$pdf->Cell(110, 10, 'Measure remaining diameter', 1, 1);

$pdf->Ln(12);
$pdf->MultiCell(
    0,
    7,
    'A Red E representative will contact you.'
);

$pdf->Output('D', 'red-e-inspection-test.pdf');
exit;
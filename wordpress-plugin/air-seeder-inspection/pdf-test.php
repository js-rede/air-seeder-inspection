<?php
/**
 * Admin-only smoke test for Asi_Pdf_Generator.
 * Leave this as a thin wrapper — real layout lives in class-pdf-generator.php.
 */

require_once dirname(__FILE__, 4) . '/wp-load.php';
require_once __DIR__ . '/class-pdf-generator.php';

if (!current_user_can('manage_options')) {
   wp_die('You do not have permission to access this page.');
}

$customer = array(
   'name'  => 'Test Customer',
   'email' => 'test@example.com',
   'phone' => '555-0100',
);

$report = array(
   'estimate' => array(
      'low'   => 4200,
      'high'  => 7800,
      'label' => '$4,200 – $7,800',
   ),
   'ratingCounts' => array(
      'maybe' => 2,
      'bad'   => 3,
   ),
   'equipment' => array(
      array(
         'key'   => 'drill',
         'lines' => array(
            'Drill: John Deere 1890 No-Till Air Drill',
            'Width: 60 ft',
            'Spacing: 7.5 in',
            'Row-units: 96 (60-90 style)',
         ),
      ),
      array(
         'key'   => 'cart',
         'lines' => array(
            'Air cart: John Deere 1910',
            '2 tanks, 430 bushels',
         ),
      ),
   ),
   'lineItems' => array(
      array(
         'title'       => 'Main Arm Pivot',
         'detail'      => 'Excessive movement',
         'rating'      => 'bad',
         'ratingLabel' => 'Needs Replacement',
         'costLabel'   => '$800 – $1,200',
      ),
      array(
         'title'       => 'Disc Opener',
         'detail'      => '96 row-units',
         'rating'      => 'maybe',
         'ratingLabel' => 'Marginal',
         'costLabel'   => '$1,500 – $2,400',
      ),
      array(
         'title'       => 'Press Wheel Spring',
         'detail'      => '',
         'rating'      => 'bad',
         'ratingLabel' => 'Needs Replacement',
         'costLabel'   => '$900 – $1,400',
      ),
   ),
   'interestItems' => array(
      'Closing system upgrade',
      'Seed boot rebuild kit',
   ),
);

try {
   $generator = new Asi_Pdf_Generator();
   $generator->download($customer, $report, 'red-e-inspection-test.pdf');
} catch (Exception $e) {
   wp_die(esc_html('PDF generation failed: ' . $e->getMessage()));
}

exit;

<?php
/**
 * Builds a Red E air seeder inspection estimate PDF from report JSON.
 *
 * Expected $customer keys: name, email, phone (optional)
 * Expected $report keys: estimate, ratingCounts, equipment, lineItems, interestItems
 * (same shape the React app posts to /send-report)
 */

require_once __DIR__ . '/lib/fpdf/fpdf.php';

class Asi_Pdf_Generator {
   const BRAND_RED = array(226, 19, 19);
   const SLATE = array(15, 23, 42);
   const MUTED = array(100, 116, 139);
   /** Lighter alternating row (was the previous "dark" fill). */
   const ROW_LIGHT = array(248, 250, 252);
   /** Darker alternating row. */
   const ROW_DARK = array(220, 226, 234);
   /** Outer border around the items table. */
   const TABLE_BORDER = array(180, 188, 200);
   const HEADER_FILL = array(241, 245, 249);

   /** @var FPDF */
   private $pdf;

   /** @var string */
   private $logo_path;

   public function __construct() {
      $this->logo_path = __DIR__ . '/assets/rede-logo.png';
      $this->pdf = new FPDF('P', 'mm', 'Letter');
      $this->pdf->SetMargins(15, 15, 15);
      $this->pdf->SetAutoPageBreak(true, 18);
      $this->pdf->SetCreator('Red E Air Seeder Inspection');
      $this->pdf->SetAuthor('Red E');
      $this->pdf->SetTitle('Air Seeder Inspection Estimate');
   }

   /**
    * @param array $customer
    * @param array $report
    * @return FPDF
    */
   public function build(array $customer, array $report) {
      $this->pdf->AddPage();
      $this->draw_header($customer);
      $this->draw_estimate_summary($report);
      $this->draw_equipment($report);
      $this->draw_line_items($report);
      $this->draw_total($report);
      $this->draw_interest($report);

      return $this->pdf;
   }

   /**
    * Write PDF to a temp file and return the path (for email attachments).
    *
    * @param array $customer
    * @param array $report
    * @return string Absolute path to temp PDF
    */
   public function write_temp_file(array $customer, array $report) {
      $this->build($customer, $report);
      $path = tempnam(sys_get_temp_dir(), 'asi-report-');
      if ($path === false) {
         throw new RuntimeException('Could not create temp file for PDF.');
      }
      // tempnam creates an empty file; use .pdf extension for clearer mime handling
      $pdf_path = $path . '.pdf';
      rename($path, $pdf_path);
      $this->pdf->Output('F', $pdf_path);
      return $pdf_path;
   }

   /**
    * Stream PDF as a browser download.
    *
    * @param array  $customer
    * @param array  $report
    * @param string $filename
    */
   public function download(array $customer, array $report, $filename = 'red-e-inspection-estimate.pdf') {
      $this->build($customer, $report);
      $this->pdf->Output('D', $filename);
   }

   private function draw_header(array $customer = array()) {
      $right_margin = 15;
      $left_margin = 15;
      $content_right = $this->pdf->GetPageWidth() - $right_margin;
      $logo_w = 36;
      $logo_y = 13.5;
      $logo_h_approx = 11;
      $hr_gap_before = 1.25;
      $hr_gap_after = 5;

      if (is_readable($this->logo_path)) {
         // Absolute top-right; nudged slightly below the title top
         $logo_x = $content_right - $logo_w;
         $this->pdf->Image($this->logo_path, $logo_x, $logo_y, $logo_w);
      }

      // Contact under the logo, right-aligned + clickable
      $url_label = 'www.rede.ag';
      $url_href = 'https://www.rede.ag';
      $phone_label = '(701) 205-1485';
      $phone_href = 'tel:+17012051485';
      $this->set_text_color(self::MUTED);
      $this->pdf->SetFont('Arial', 'BI', 9);
      $contact_y = $logo_y + $logo_h_approx - 2;
      $this->pdf->SetXY($content_right - $logo_w, $contact_y);
      $this->pdf->Cell($logo_w, 4, $this->txt($url_label), 0, 2, 'R', false, $url_href);
      $this->pdf->SetX($content_right - $logo_w);
      $this->pdf->Cell($logo_w, 4, $this->txt($phone_label), 0, 0, 'R', false, $phone_href);
      $url_y = $contact_y; // used below for HR clearance

      $title = 'Air Seeder Inspection Estimate';
      $date = function_exists('wp_date') ? wp_date('F j, Y') : date('F j, Y');
      $title_area_w = $content_right - $left_margin - $logo_w - 6;

      // Title on its own line
      $this->pdf->SetXY($left_margin, 12);
      $this->set_text_color(self::SLATE);
      $this->pdf->SetFont('Arial', 'B', 18);
      $this->pdf->Cell($title_area_w, 9, $this->txt($title), 0, 1, 'L');

      // Customer under the title
      $this->draw_customer_line($customer, $left_margin, $title_area_w);

      // Date under customer
      $this->set_text_color(self::MUTED);
      $this->pdf->SetFont('Arial', '', 10);
      $this->pdf->SetX($left_margin);
      $this->pdf->Cell($title_area_w, 5.5, $this->txt($date), 0, 1, 'L');

      $line_y = max($this->pdf->GetY(), $url_y + 8.5) + $hr_gap_before;
      $this->pdf->SetY($line_y);

      $this->pdf->SetDrawColor(self::BRAND_RED[0], self::BRAND_RED[1], self::BRAND_RED[2]);
      $this->pdf->SetLineWidth(0.6);
      $y = $this->pdf->GetY();
      $this->pdf->Line($left_margin, $y, $content_right, $y);
      $this->pdf->SetDrawColor(226, 232, 240);
      $this->pdf->SetLineWidth(0.2);
      $this->pdf->Ln($hr_gap_after);
   }

   private function draw_customer_line(array $customer, $left_margin, $max_w) {
      $name = isset($customer['name']) ? trim((string) $customer['name']) : '';
      $email = isset($customer['email']) ? trim((string) $customer['email']) : '';
      $phone = isset($customer['phone']) ? trim((string) $customer['phone']) : '';
      $values = array_values(array_filter(array($name, $email, $phone)));

      $this->pdf->SetX($left_margin);

      if (count($values) === 0) {
         $this->set_text_color(self::MUTED);
         $this->pdf->SetFont('Arial', '', 10);
         $this->pdf->Cell($max_w, 5.5, $this->txt('Not provided'), 0, 1, 'L');
         return;
      }

      $first = true;
      foreach ($values as $value) {
         if (!$first) {
            $this->pdf->Cell(4, 5.5, '', 0, 0);
         }

         $this->set_text_color(self::SLATE);
         $this->pdf->SetFont('Arial', '', 10);
         $value_w = $this->pdf->GetStringWidth($this->txt($value)) + 1;
         $this->pdf->Cell($value_w, 5.5, $this->txt($value), 0, 0);

         $first = false;
      }
      $this->pdf->Ln(5.5);
   }

   private function draw_estimate_summary(array $report) {
      $label = isset($report['estimate']['label']) ? (string) $report['estimate']['label'] : '$0';
      $maybe = isset($report['ratingCounts']['maybe']) ? (int) $report['ratingCounts']['maybe'] : 0;
      $bad = isset($report['ratingCounts']['bad']) ? (int) $report['ratingCounts']['bad'] : 0;

      // Middle ground between tight (6/7) and original (8/9)
      $this->set_text_color(self::BRAND_RED);
      $this->pdf->SetFont('Arial', 'B', 11);
      $this->pdf->Cell(0, 7, $this->txt('ESTIMATED SERVICE RANGE'), 0, 1);

      $this->set_text_color(self::SLATE);
      $this->pdf->SetFont('Arial', 'B', 22);
      $this->pdf->Cell(0, 8, $this->txt($this->en_dash_ranges($label)), 0, 1);

      $this->set_text_color(self::MUTED);
      $this->pdf->SetFont('Arial', '', 10);
      $this->pdf->Cell(0, 5, $this->txt($maybe . ' marginal   ' . $bad . ' need replacement'), 0, 1);
      $this->pdf->Ln(4);
   }

   private function draw_equipment(array $report) {
      if (empty($report['equipment']) || !is_array($report['equipment'])) {
         return;
      }

      $drill_lines = array();
      $cart_lines = array();
      $other_groups = array();

      foreach ($report['equipment'] as $group) {
         if (empty($group['lines']) || !is_array($group['lines'])) {
            continue;
         }
         $lines = array_values(array_filter(array_map('strval', $group['lines'])));
         if (count($lines) === 0) {
            continue;
         }

         $key = isset($group['key']) ? (string) $group['key'] : '';
         if ($key === 'drill') {
            $drill_lines = $lines;
         } elseif ($key === 'cart') {
            $cart_lines = $lines;
         } else {
            $other_groups[] = $lines;
         }
      }

      if (count($drill_lines) === 0 && count($cart_lines) === 0 && count($other_groups) === 0) {
         return;
      }

      $this->section_title('Equipment', 'L', 6);

      $layout = $this->get_content_layout();
      $left = $layout['left'];
      $content_w = $layout['content_w'];
      // Align air-cart column with the items-table rating column ("Needs Replacement")
      $cart_x = $layout['rating_x'];
      $drill_w = $cart_x - $left - 4;
      $cart_w = $layout['col_rating'] + $layout['col_cost'];
      $start_y = $this->pdf->GetY();

      if (count($drill_lines) > 0 && count($cart_lines) > 0) {
         $left_bottom = $this->write_equipment_column($left, $start_y, $drill_w, $drill_lines);
         $right_bottom = $this->write_equipment_column($cart_x, $start_y, $cart_w, $cart_lines);
         $this->pdf->SetY(max($left_bottom, $right_bottom));
      } elseif (count($drill_lines) > 0) {
         $this->pdf->SetY($this->write_equipment_column($left, $start_y, $content_w, $drill_lines));
      } elseif (count($cart_lines) > 0) {
         $this->pdf->SetY($this->write_equipment_column($left, $start_y, $content_w, $cart_lines));
      }

      foreach ($other_groups as $lines) {
         $y = $this->pdf->GetY();
         $this->pdf->SetY($this->write_equipment_column($left, $y, $content_w, $lines));
         $this->pdf->Ln(1);
      }

      $this->pdf->Ln(4);
   }

   /**
    * Shared left/content/rating column geometry for equipment + items table.
    *
    * @return array{left:float,content_w:float,col_item:float,col_rating:float,col_cost:float,rating_x:float}
    */
   private function get_content_layout() {
      $left = 15;
      $content_w = $this->pdf->GetPageWidth() - $left - 15;
      $col_rating = 38;
      $col_cost = 42;
      $col_item = $content_w - $col_rating - $col_cost;

      return array(
         'left'       => $left,
         'content_w'  => $content_w,
         'col_item'   => $col_item,
         'col_rating' => $col_rating,
         'col_cost'   => $col_cost,
         'rating_x'   => $left + $col_item,
      );
   }

   /**
    * Write an equipment block in a fixed-width column. Returns the Y after the last line.
    *
    * @param float $x
    * @param float $y
    * @param float $w
    * @param array $lines
    * @return float
    */
   private function write_equipment_column($x, $y, $w, array $lines) {
      $this->pdf->SetXY($x, $y);

      // Machine name (bold)
      $this->set_text_color(self::SLATE);
      $this->pdf->SetFont('Arial', 'B', 10);
      $this->pdf->MultiCell($w, 5, $this->txt($lines[0]));

      if (count($lines) > 1) {
         $attrs = implode('   ', array_slice($lines, 1));
         $this->pdf->SetX($x);
         $this->pdf->SetFont('Arial', '', 10);
         $this->pdf->MultiCell($w, 5, $this->txt($attrs));
      }

      return $this->pdf->GetY();
   }

   private function draw_line_items(array $report) {
      if (empty($report['lineItems']) || !is_array($report['lineItems'])) {
         return;
      }

      $this->section_title('Items affecting estimate');

      $layout = $this->get_content_layout();
      $left = $layout['left'];
      $table_w = $layout['content_w'];
      $col_rating = $layout['col_rating'];
      $col_cost = $layout['col_cost'];
      $col_item = $layout['col_item'];
      $row_h = 9;

      $table_top = $this->pdf->GetY();
      $alt = false;

      foreach ($report['lineItems'] as $item) {
         $title = isset($item['title']) ? (string) $item['title'] : '';
         $detail = isset($item['detail']) ? (string) $item['detail'] : '';
         $rating = isset($item['ratingLabel']) ? (string) $item['ratingLabel'] : '';
         $cost = isset($item['costLabel']) ? (string) $item['costLabel'] : '';

         $left_text = $title;
         if ($detail !== '') {
            $left_text .= ' — ' . $detail;
         }

         $fill = $alt ? self::ROW_DARK : self::ROW_LIGHT;

         $this->pdf->SetFillColor($fill[0], $fill[1], $fill[2]);
         $this->pdf->SetDrawColor($fill[0], $fill[1], $fill[2]);
         $this->pdf->SetLineWidth(0.2);

         $this->set_text_color(self::SLATE);
         $this->pdf->SetFont('Arial', '', 9);

         // Slightly more chars allowed now that the item column is wider
         $this->pdf->Cell($col_item, $row_h, $this->txt($this->truncate($left_text, 72)), 1, 0, 'L', true);
         $this->pdf->Cell($col_rating, $row_h, $this->txt($this->truncate($rating, 20)), 1, 0, 'L', true);
         $this->pdf->Cell($col_cost, $row_h, $this->txt($this->en_dash_ranges($cost)), 1, 1, 'R', true);

         $alt = !$alt;
      }

      $table_bottom = $this->pdf->GetY();
      $this->pdf->SetDrawColor(self::TABLE_BORDER[0], self::TABLE_BORDER[1], self::TABLE_BORDER[2]);
      $this->pdf->SetLineWidth(0.4);
      $this->pdf->Rect($left, $table_top, $table_w, $table_bottom - $table_top);

      $this->pdf->Ln(5);
   }

   private function draw_total(array $report) {
      $label = isset($report['estimate']['label']) ? (string) $report['estimate']['label'] : '$0';

      $this->set_text_color(self::BRAND_RED);
      $this->pdf->SetFont('Arial', 'B', 11);
      $this->pdf->Cell(0, 5.25, $this->txt('TOTAL ESTIMATE'), 0, 1, 'R');

      $this->set_text_color(self::SLATE);
      $this->pdf->SetFont('Arial', 'B', 16);
      $this->pdf->Cell(0, 7, $this->txt($this->en_dash_ranges($label)), 0, 1, 'R');

      $this->set_text_color(self::MUTED);
      $this->pdf->SetFont('Arial', 'I', 8);
      $this->pdf->MultiCell(
         0,
         4,
         $this->txt('All price estimates are for informational purposes only and are subject to change.'),
         0,
         'R'
      );
      $this->pdf->Ln(3);
   }

   private function draw_interest(array $report) {
      if (empty($report['interestItems']) || !is_array($report['interestItems'])) {
         return;
      }

      $this->section_title('Interested in', 'L', 6);
      foreach ($report['interestItems'] as $item) {
         $text = is_string($item) ? $item : '';
         if ($text === '') {
            continue;
         }
         $this->body_text('• ' . $text);
      }

      $this->pdf->Ln(1);
      $this->set_text_color(self::MUTED);
      $this->pdf->SetFont('Arial', 'I', 9);
      $this->pdf->MultiCell(0, 5, $this->txt('A Red E representative can follow up with more information.'));
      $this->pdf->Ln(1);
   }

   private function section_title($title, $align = 'L', $height = 8) {
      $this->set_text_color(self::BRAND_RED);
      $this->pdf->SetFont('Arial', 'B', 11);
      $this->pdf->Cell(0, $height, $this->txt(strtoupper($title)), 0, 1, $align);
   }

   private function body_text($text, $bold = false) {
      $this->set_text_color(self::SLATE);
      $this->pdf->SetFont('Arial', $bold ? 'B' : '', 10);
      $this->pdf->MultiCell(0, 5, $this->txt($text));
   }

   private function set_text_color(array $rgb) {
      $this->pdf->SetTextColor($rgb[0], $rgb[1], $rgb[2]);
   }

   /**
    * Turn spaced hyphens in money ranges into en-dashes: $4,200 - $7,800 → $4,200 – $7,800
    */
   private function en_dash_ranges($text) {
      $text = (string) $text;
      return preg_replace('/\s*[-–—]\s*/u', ' – ', $text);
   }

   /**
    * FPDF core fonts expect ISO-8859-1 / Windows-1252-ish bytes.
    */
   private function txt($text) {
      $text = (string) $text;
      // Keep en-dash (–) for iconv → windows-1252; convert other fancy punctuation.
      $text = str_replace(
         array('—', '’', '‘', '“', '”', '…', '·'),
         array('-', "'", "'", '"', '"', '...', ' '),
         $text
      );

      if (function_exists('iconv')) {
         $converted = @iconv('UTF-8', 'windows-1252//TRANSLIT//IGNORE', $text);
         if ($converted !== false) {
            return $converted;
         }
      }

      return $text;
   }

   private function truncate($text, $max_chars) {
      $text = (string) $text;
      if (strlen($text) <= $max_chars) {
         return $text;
      }
      return substr($text, 0, max(0, $max_chars - 3)) . '...';
   }
}

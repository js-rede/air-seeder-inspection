<?php
/**
 * POST {
 *   "name": "Joe Schwehr",
 *   "firstName": "Joe",
 *   "lastName": "Schwehr",
 *   "emails": ["joe@example.com"],
 *   "phone": "(701) 555-0100",   // optional, for PDF header
 *   "email": "joe@example.com",  // optional contact email for PDF header
 *   "report": { estimate, equipment, lineItems, interestItems, ratingCounts }
 * }
 */

if (!defined('ABSPATH')) {
   exit;
}

require_once __DIR__ . '/email-report-template.php';
require_once dirname(__DIR__) . '/class-pdf-generator.php';

add_action('rest_api_init', 'asi_register_send_report_route');

function asi_register_send_report_route() {
   register_rest_route(
      'air-seeder-inspection/v1',
      '/send-report',
      array(
         'methods'             => 'POST',
         'callback'            => 'asi_handle_send_report',
         'permission_callback' => '__return_true',
      )
   );
}

/**
 * Sanitize a name fragment for use in a filename token.
 *
 * @param string $value
 * @return string
 */
function asi_pdf_filename_token($value) {
   $value = sanitize_file_name((string) $value);
   $value = preg_replace('/[^A-Za-z0-9]+/', '-', $value);
   $value = trim((string) $value, '-');
   return $value;
}

/**
 * Build attachment basename:
 * Red-E-Inspection-Estimate-Schwehr-Joe-2026-07-29-1537.pdf
 *
 * @param string $first_name
 * @param string $last_name
 * @param string $full_name
 * @return string
 */
function asi_build_pdf_filename($first_name, $last_name, $full_name) {
   $parts = array('Red-E-Inspection-Estimate');

   $last = asi_pdf_filename_token($last_name);
   $first = asi_pdf_filename_token($first_name);

   // Fall back to splitting full name if first/last were not posted
   if ($last === '' && $first === '' && $full_name !== '' && strtolower($full_name) !== 'there') {
      $name_parts = preg_split('/\s+/', trim($full_name));
      if (is_array($name_parts) && count($name_parts) >= 2) {
         $first = asi_pdf_filename_token($name_parts[0]);
         $last = asi_pdf_filename_token($name_parts[count($name_parts) - 1]);
      } else {
         $first = asi_pdf_filename_token($full_name);
      }
   }

   if ($last !== '') {
      $parts[] = $last;
   }
   if ($first !== '') {
      $parts[] = $first;
   }

   $stamp = function_exists('wp_date') ? wp_date('Y-m-d-Hi') : date('Y-m-d-Hi');
   $parts[] = $stamp;

   return implode('-', $parts) . '.pdf';
}

/**
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function asi_handle_send_report($request) {
   $params = $request->get_json_params();
   if (!is_array($params)) {
      $params = array();
   }

   $first_name = sanitize_text_field(isset($params['firstName']) ? (string) $params['firstName'] : '');
   $last_name = sanitize_text_field(isset($params['lastName']) ? (string) $params['lastName'] : '');

   $name = sanitize_text_field(isset($params['name']) ? (string) $params['name'] : '');
   if ($name === '') {
      $name = trim($first_name . ' ' . $last_name);
   }
   if ($name === '') {
      $name = 'there';
   }

   $raw_emails = array();
   if (isset($params['emails']) && is_array($params['emails'])) {
      $raw_emails = $params['emails'];
   } elseif (!empty($params['email'])) {
      $raw_emails = array($params['email']);
   }

   $emails = array();
   foreach ($raw_emails as $email) {
      $email = sanitize_email((string) $email);
      if ($email !== '' && is_email($email)) {
         $emails[] = $email;
      }
   }
   $emails = array_values(array_unique($emails));

   if (count($emails) === 0) {
      return new WP_Error('missing_email', 'At least one valid email is required.', array('status' => 400));
   }

   $contact_email = sanitize_email(isset($params['email']) ? (string) $params['email'] : '');
   if ($contact_email === '' || !is_email($contact_email)) {
      $contact_email = $emails[0];
   }

   $phone = sanitize_text_field(isset($params['phone']) ? (string) $params['phone'] : '');

   $report = (isset($params['report']) && is_array($params['report'])) ? $params['report'] : array();
   $customer = array(
      'name'  => $name,
      'email' => $contact_email,
      'phone' => $phone,
   );

   $subject = 'Your Red E Air Seeder Inspection Estimate';
   $body = asi_build_report_email_html($name, $report);
   $headers = array('Content-Type: text/html; charset=UTF-8');

   $pdf_path = null;
   try {
      $generator = new Asi_Pdf_Generator();
      $tmp_path = $generator->write_temp_file($customer, $report);
      $pdf_filename = asi_build_pdf_filename($first_name, $last_name, $name);
      $pdf_path = dirname($tmp_path) . '/' . $pdf_filename;
      if (!@rename($tmp_path, $pdf_path)) {
         $pdf_path = $tmp_path;
      }
   } catch (Exception $e) {
      return new WP_Error(
         'pdf_failed',
         'Could not generate the PDF attachment.',
         array('status' => 500)
      );
   }

   $attachments = array($pdf_path);
   $failed = array();

   // Embed logo inline (CID) so clients don't block it as an external image
   add_action('phpmailer_init', 'asi_embed_report_logo');

   try {
      foreach ($emails as $to) {
         $sent = wp_mail($to, $subject, $body, $headers, $attachments);
         if (!$sent) {
            $failed[] = $to;
         }
      }
   } finally {
      remove_action('phpmailer_init', 'asi_embed_report_logo');
      if ($pdf_path && file_exists($pdf_path)) {
         @unlink($pdf_path);
      }
   }

   if (count($failed) === count($emails)) {
      return new WP_Error('mail_failed', 'Email could not be sent.', array('status' => 500));
   }

   return rest_ensure_response(
      array(
         'ok'     => true,
         'to'     => $emails,
         'failed' => $failed,
      )
   );
}

/**
 * Attach the Red E logo as an inline CID image for report emails.
 *
 * @param PHPMailer $phpmailer
 */
function asi_embed_report_logo($phpmailer) {
   $logo_path = dirname(__DIR__) . '/assets/rede-logo.png';
   if (!is_readable($logo_path)) {
      return;
   }

   try {
      $phpmailer->addEmbeddedImage($logo_path, 'asi-rede-logo', 'rede-logo.png');
   } catch (Exception $e) {
      // Leave body without logo rather than failing the whole send
   }
}

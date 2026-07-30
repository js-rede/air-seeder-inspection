<?php
/**
 * POST {
 *   "firstName": "Joe",
 *   "lastName": "Schwehr",
 *   "email": "joe@example.com",
 *   "phone": "(701) 555-0100",
 *   "report": { estimate, equipment, lineItems, interestItems, ratingCounts }
 * }
 *
 * Generates the estimate PDF and attaches it to the HubSpot contact as a note.
 * Heavy classes are loaded only inside the request handler so a PDF/HubSpot
 * issue cannot take down the whole WordPress site on every page load.
 */

if (!defined('ABSPATH')) {
   exit;
}

add_action('rest_api_init', 'asi_register_request_follow_up_route');

function asi_register_request_follow_up_route() {
   register_rest_route(
      'air-seeder-inspection/v1',
      '/request-follow-up',
      array(
         'methods'             => 'POST',
         'callback'            => 'asi_handle_request_follow_up',
         'permission_callback' => '__return_true',
      )
   );
}

/**
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function asi_handle_request_follow_up($request) {
   $pdf_class = dirname(__DIR__) . '/class-pdf-generator.php';
   $hubspot_class = dirname(__DIR__) . '/class-hubspot-client.php';

   if (!is_readable($pdf_class) || !is_readable($hubspot_class)) {
      return new WP_Error(
         'missing_dependency',
         'PDF or HubSpot helper is missing on the server.',
         array('status' => 500)
      );
   }

   require_once $pdf_class;
   require_once $hubspot_class;

   $params = $request->get_json_params();
   if (!is_array($params)) {
      $params = array();
   }

   $first_name = sanitize_text_field(isset($params['firstName']) ? (string) $params['firstName'] : '');
   $last_name = sanitize_text_field(isset($params['lastName']) ? (string) $params['lastName'] : '');
   $email = sanitize_email(isset($params['email']) ? (string) $params['email'] : '');
   $phone = sanitize_text_field(isset($params['phone']) ? (string) $params['phone'] : '');

   if ($email === '' || !is_email($email)) {
      return new WP_Error('missing_email', 'A valid email is required.', array('status' => 400));
   }
   if ($first_name === '' || $last_name === '') {
      return new WP_Error('missing_name', 'First and last name are required.', array('status' => 400));
   }

   $name = trim($first_name . ' ' . $last_name);
   $report = (isset($params['report']) && is_array($params['report'])) ? $params['report'] : array();
   $customer = array(
      'name'      => $name,
      'firstName' => $first_name,
      'lastName'  => $last_name,
      'email'     => $email,
      'phone'     => $phone,
   );

   if (!Asi_HubSpot_Client::is_configured()) {
      return new WP_Error(
         'hubspot_not_configured',
         'HubSpot is not configured. Add ASI_HUBSPOT_ACCESS_TOKEN (or HS_PRIVATE_TOKEN) in wp-config.php.',
         array('status' => 503)
      );
   }

   $pdf_path = null;
   try {
      $generator = new Asi_Pdf_Generator();
      $tmp_path = $generator->write_temp_file($customer, $report);

      if (function_exists('asi_build_pdf_filename')) {
         $pdf_filename = asi_build_pdf_filename($first_name, $last_name, $name);
      } else {
         $stamp = function_exists('wp_date') ? wp_date('Y-m-d-Hi') : date('Y-m-d-Hi');
         $pdf_filename = 'Red-E-Inspection-Estimate-' . $last_name . '-' . $first_name . '-' . $stamp . '.pdf';
         $pdf_filename = sanitize_file_name($pdf_filename);
      }

      $pdf_path = dirname($tmp_path) . '/' . $pdf_filename;
      if (!@rename($tmp_path, $pdf_path)) {
         $pdf_path = $tmp_path;
         $pdf_filename = basename($pdf_path);
      }

      $hubspot = new Asi_HubSpot_Client();
      $result = $hubspot->attach_inspection_report($customer, $pdf_path, $pdf_filename, $report);
   } catch (Exception $e) {
      if ($pdf_path && file_exists($pdf_path)) {
         @unlink($pdf_path);
      }
      return new WP_Error(
         'hubspot_sync_failed',
         'Could not sync the inspection report to HubSpot.',
         array(
            'status'  => 500,
            'details' => $e->getMessage(),
         )
      );
   }

   if ($pdf_path && file_exists($pdf_path)) {
      @unlink($pdf_path);
   }

   return rest_ensure_response(
      array(
         'ok'         => true,
         'contact_id' => $result['contact_id'],
         'file_id'    => $result['file_id'],
         'note_id'    => $result['note_id'],
      )
   );
}

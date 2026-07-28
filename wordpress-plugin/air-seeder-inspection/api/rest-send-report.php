<?php
/**
 * POST {
 *   "name": "Joe",
 *   "emails": ["joe@example.com"],
 *   "report": { estimate, equipment, lineItems, interestItems, ratingCounts }
 * }
 */

if (!defined('ABSPATH')) {
   exit;
}

require_once __DIR__ . '/email-report-template.php';

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
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function asi_handle_send_report($request) {
   $params = $request->get_json_params();
   if (!is_array($params)) {
      $params = array();
   }

   $name = sanitize_text_field(isset($params['name']) ? (string) $params['name'] : '');
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

   $report = (isset($params['report']) && is_array($params['report'])) ? $params['report'] : array();
   $subject = 'Your Red E Air Seeder Inspection Estimate';
   $body = asi_build_report_email_html($name, $report);
   $headers = array('Content-Type: text/html; charset=UTF-8');

   $failed = array();
   foreach ($emails as $to) {
      $sent = wp_mail($to, $subject, $body, $headers);
      if (!$sent) {
         $failed[] = $to;
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

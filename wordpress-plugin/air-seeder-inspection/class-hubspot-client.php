<?php
/**
 * Minimal HubSpot CRM helper for air-seeder inspection follow-ups.
 *
 * Token: define('ASI_HUBSPOT_ACCESS_TOKEN', 'pat-...'); in wp-config.php
 *    or set option asi_hubspot_access_token
 *
 * Private app scopes needed:
 *   crm.objects.contacts.read, crm.objects.contacts.write,
 *   crm.objects.notes.write, files
 */

if (!defined('ABSPATH')) {
   exit;
}

class Asi_HubSpot_Client {
   const API_BASE = 'https://api.hubapi.com';
   /** Note-to-contact association type id */
   const NOTE_TO_CONTACT = 202;

   /**
    * @return string
    */
   public static function get_access_token() {
      if (defined('ASI_HUBSPOT_ACCESS_TOKEN') && ASI_HUBSPOT_ACCESS_TOKEN) {
         return (string) ASI_HUBSPOT_ACCESS_TOKEN;
      }

      // Older Red E config name already present in wp-config.php
      if (defined('HS_PRIVATE_TOKEN') && HS_PRIVATE_TOKEN) {
         return (string) HS_PRIVATE_TOKEN;
      }

      $option = get_option('asi_hubspot_access_token', '');
      return is_string($option) ? $option : '';
   }

   /**
    * @return bool
    */
   public static function is_configured() {
      return self::get_access_token() !== '';
   }

   /**
    * Upsert contact by email, upload PDF, attach as a note on the contact.
    *
    * @param array  $customer name, email, phone, firstName?, lastName?
    * @param string $pdf_path Absolute path to PDF file
    * @param string $pdf_filename Basename for HubSpot
    * @param array  $report Optional report for note body summary
    * @return array Keys: contact_id, file_id, note_id
    */
   public function attach_inspection_report(array $customer, $pdf_path, $pdf_filename, array $report = array()) {
      if (!self::is_configured()) {
         throw new RuntimeException('HubSpot access token is not configured.');
      }
      if (!is_readable($pdf_path)) {
         throw new RuntimeException('PDF file is not readable.');
      }

      $contact_id = $this->upsert_contact($customer);
      $file_id = $this->upload_file($pdf_path, $pdf_filename);
      $note_id = $this->create_note_with_attachment($contact_id, $file_id, $customer, $report);

      return array(
         'contact_id' => $contact_id,
         'file_id'    => $file_id,
         'note_id'    => $note_id,
      );
   }

   /**
    * @param array $customer
    * @return string Contact ID
    */
   private function upsert_contact(array $customer) {
      $email = isset($customer['email']) ? sanitize_email((string) $customer['email']) : '';
      if ($email === '' || !is_email($email)) {
         throw new RuntimeException('A valid email is required for HubSpot.');
      }

      $first = isset($customer['firstName']) ? sanitize_text_field((string) $customer['firstName']) : '';
      $last = isset($customer['lastName']) ? sanitize_text_field((string) $customer['lastName']) : '';
      if (($first === '' || $last === '') && !empty($customer['name'])) {
         $parts = preg_split('/\s+/', trim((string) $customer['name']));
         if (is_array($parts) && count($parts) >= 2) {
            if ($first === '') {
               $first = $parts[0];
            }
            if ($last === '') {
               $last = $parts[count($parts) - 1];
            }
         } elseif ($first === '' && is_array($parts) && count($parts) === 1) {
            $first = $parts[0];
         }
      }

      $phone = isset($customer['phone']) ? sanitize_text_field((string) $customer['phone']) : '';

      $properties = array(
         'email'     => $email,
         'firstname' => $first,
         'lastname'  => $last,
      );
      if ($phone !== '') {
         $properties['phone'] = $phone;
      }

      $existing_id = $this->find_contact_id_by_email($email);
      if ($existing_id) {
         $this->request('PATCH', '/crm/v3/objects/contacts/' . rawurlencode($existing_id), array(
            'properties' => $properties,
         ));
         return $existing_id;
      }

      $created = $this->request('POST', '/crm/v3/objects/contacts', array(
         'properties' => $properties,
      ));

      if (empty($created['id'])) {
         throw new RuntimeException('HubSpot did not return a contact id.');
      }

      return (string) $created['id'];
   }

   /**
    * @param string $email
    * @return string|null
    */
   private function find_contact_id_by_email($email) {
      $result = $this->request('POST', '/crm/v3/objects/contacts/search', array(
         'filterGroups' => array(
            array(
               'filters' => array(
                  array(
                     'propertyName' => 'email',
                     'operator'     => 'EQ',
                     'value'        => $email,
                  ),
               ),
            ),
         ),
         'limit' => 1,
      ));

      if (!empty($result['results'][0]['id'])) {
         return (string) $result['results'][0]['id'];
      }

      return null;
   }

   /**
    * @param string $pdf_path
    * @param string $pdf_filename
    * @return string File ID
    */
   private function upload_file($pdf_path, $pdf_filename) {
      $token = self::get_access_token();
      $boundary = 'asi_' . wp_generate_password(16, false);
      $file_contents = file_get_contents($pdf_path);
      if ($file_contents === false) {
         throw new RuntimeException('Could not read PDF for HubSpot upload.');
      }

      $options = wp_json_encode(
         array(
            'access'        => 'PRIVATE',
            'overwrite'     => false,
            'duplicateValidationStrategy' => 'NONE',
         )
      );

      $body  = '--' . $boundary . "\r\n";
      $body .= 'Content-Disposition: form-data; name="file"; filename="' . $pdf_filename . '"' . "\r\n";
      $body .= 'Content-Type: application/pdf' . "\r\n\r\n";
      $body .= $file_contents . "\r\n";
      $body .= '--' . $boundary . "\r\n";
      $body .= 'Content-Disposition: form-data; name="options"' . "\r\n\r\n";
      $body .= $options . "\r\n";
      $body .= '--' . $boundary . "\r\n";
      $body .= 'Content-Disposition: form-data; name="folderPath"' . "\r\n\r\n";
      $body .= '/air-seeder-inspections' . "\r\n";
      $body .= '--' . $boundary . '--';

      $response = wp_remote_post(
         self::API_BASE . '/files/v3/files',
         array(
            'timeout' => 60,
            'headers' => array(
               'Authorization' => 'Bearer ' . $token,
               'Content-Type'  => 'multipart/form-data; boundary=' . $boundary,
            ),
            'body' => $body,
         )
      );

      return $this->parse_id_from_response($response, 'file');
   }

   /**
    * @param string $contact_id
    * @param string $file_id
    * @param array  $customer
    * @param array  $report
    * @return string Note ID
    */
   private function create_note_with_attachment($contact_id, $file_id, array $customer, array $report) {
      $name = isset($customer['name']) ? (string) $customer['name'] : '';
      $estimate = isset($report['estimate']['label']) ? (string) $report['estimate']['label'] : '';

      $lines = array('Air Seeder Inspection Estimate');
      if ($name !== '' && strtolower($name) !== 'there') {
         $lines[] = 'Customer: ' . $name;
      }
      if ($estimate !== '') {
         $lines[] = 'Estimated service range: ' . $estimate;
      }
      $lines[] = 'Full PDF report attached.';

      $created = $this->request('POST', '/crm/v3/objects/notes', array(
         'properties' => array(
            'hs_timestamp'      => (string) (int) round(microtime(true) * 1000),
            'hs_note_body'      => implode("\n", $lines),
            'hs_attachment_ids' => (string) $file_id,
         ),
         'associations' => array(
            array(
               'to'    => array('id' => $contact_id),
               'types' => array(
                  array(
                     'associationCategory' => 'HUBSPOT_DEFINED',
                     'associationTypeId'   => self::NOTE_TO_CONTACT,
                  ),
               ),
            ),
         ),
      ));

      if (empty($created['id'])) {
         throw new RuntimeException('HubSpot did not return a note id.');
      }

      return (string) $created['id'];
   }

   /**
    * @param string     $method
    * @param string     $path
    * @param array|null $payload
    * @return array
    */
   private function request($method, $path, $payload = null) {
      $args = array(
         'method'  => $method,
         'timeout' => 30,
         'headers' => array(
            'Authorization' => 'Bearer ' . self::get_access_token(),
            'Content-Type'  => 'application/json',
         ),
      );

      if ($payload !== null) {
         $args['body'] = wp_json_encode($payload);
      }

      $response = wp_remote_request(self::API_BASE . $path, $args);
      return $this->decode_response($response);
   }

   /**
    * @param array|WP_Error $response
    * @param string         $label
    * @return string
    */
   private function parse_id_from_response($response, $label) {
      $data = $this->decode_response($response);
      if (empty($data['id'])) {
         throw new RuntimeException('HubSpot did not return a ' . $label . ' id.');
      }
      return (string) $data['id'];
   }

   /**
    * @param array|WP_Error $response
    * @return array
    */
   private function decode_response($response) {
      if (is_wp_error($response)) {
         throw new RuntimeException('HubSpot request failed: ' . $response->get_error_message());
      }

      $code = (int) wp_remote_retrieve_response_code($response);
      $raw = wp_remote_retrieve_body($response);
      $data = json_decode($raw, true);
      if (!is_array($data)) {
         $data = array();
      }

      if ($code < 200 || $code >= 300) {
         $message = isset($data['message']) ? (string) $data['message'] : 'HTTP ' . $code;
         throw new RuntimeException('HubSpot error: ' . $message);
      }

      return $data;
   }
}

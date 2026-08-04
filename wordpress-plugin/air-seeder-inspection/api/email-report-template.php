<?php
/**
 * Build HTML body for the inspection report email.
 *
 * @param string $name
 * @param array  $report
 * @return string
 */
function asi_build_report_email_html($name, $report) {
   $name = $name !== '' ? $name : 'there';
   $estimate_label = isset($report['estimate']['label']) ? (string) $report['estimate']['label'] : '$0';
   $maybe_count = isset($report['ratingCounts']['maybe']) ? (int) $report['ratingCounts']['maybe'] : 0;
   $bad_count = isset($report['ratingCounts']['bad']) ? (int) $report['ratingCounts']['bad'] : 0;

   $logo_src = '';
   if (defined('ASI_PLUGIN_URL')) {
      $logo_src = esc_url(ASI_PLUGIN_URL . 'assets/rede-logo.png');
   }
   if ($logo_src === '') {
      $logo_src = 'https://rede-ag.com/wp-content/plugins/air-seeder-inspection/assets/rede-logo.png';
   }

   $equipment_html = '';
   if (!empty($report['equipment']) && is_array($report['equipment'])) {
      $equipment_html .= '<h2 style="margin:24px 0 8px;font-size:16px;color:#334155;">Equipment</h2>';
      foreach ($report['equipment'] as $group) {
         if (empty($group['lines']) || !is_array($group['lines'])) {
            continue;
         }
         $equipment_html .= '<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.5;">';
         foreach ($group['lines'] as $line) {
            $equipment_html .= esc_html((string) $line) . '<br />';
         }
         $equipment_html .= '</p>';
      }
   }

   $items_html = '';
   if (!empty($report['lineItems']) && is_array($report['lineItems'])) {
      $items_html .= '<h2 style="margin:24px 0 8px;font-size:16px;color:#334155;">Items Affecting Estimate</h2>';
      $items_html .= '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">';
      foreach ($report['lineItems'] as $item) {
         $title = isset($item['title']) ? (string) $item['title'] : '';
         $detail = isset($item['detail']) ? (string) $item['detail'] : '';
         $rating = isset($item['ratingLabel']) ? (string) $item['ratingLabel'] : '';
         $cost = isset($item['costLabel']) ? (string) $item['costLabel'] : '';

         $items_html .= '<tr>';
         $items_html .= '<td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;vertical-align:top;">';
         $items_html .= '<strong>' . esc_html($title) . '</strong>';
         if ($rating !== '') {
            $items_html .= ' <span style="color:#64748b;font-size:12px;text-transform:uppercase;">' . esc_html($rating) . '</span>';
         }
         if ($detail !== '') {
            $items_html .= '<br /><span style="color:#64748b;">' . esc_html($detail) . '</span>';
         }
         $items_html .= '</td>';
         $items_html .= '<td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;text-align:right;white-space:nowrap;vertical-align:top;">' . esc_html($cost) . '</td>';
         $items_html .= '</tr>';
      }
      $items_html .= '</table>';
   }

   $interest_html = '';
   if (!empty($report['interestItems']) && is_array($report['interestItems'])) {
      $interest_html .= '<h2 style="margin:24px 0 8px;font-size:16px;color:#334155;">Interested In</h2><ul style="margin:0;padding-left:18px;color:#475569;font-size:14px;">';
      foreach ($report['interestItems'] as $item) {
         $interest_html .= '<li style="margin:0 0 6px;">' . esc_html((string) $item) . '</li>';
      }
      $interest_html .= '</ul>';
      $interest_html .= '<p style="margin:12px 0 0;color:#64748b;font-size:13px;font-style:italic;">A Red E representative can follow up with more information.</p>';
   }

   return '
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    Here&#39;s your estimate from your online inspection...
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background-color:#ffffff;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
      <div style="margin:0 0 28px;">
        <img src="' . esc_attr($logo_src) . '" alt="Red E" width="140" style="display:block;border:0;margin:0 0 8px;width:140px;height:auto;" />
        <p style="margin:0;font-size:12px;font-style:italic;color:#94a3b8;line-height:1.5;">
          <a href="tel:+17012051485" style="color:#94a3b8;text-decoration:none;">(701) 205-1485</a>
          &nbsp;·&nbsp;
          <a href="https://www.rede.ag" style="color:#94a3b8;text-decoration:underline;">www.rede.ag</a>
        </p>
      </div>

      <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Air Seeder Inspection Summary</h1>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.5;">Greetings, ' . esc_html($name) . '. Here is your inspection estimate.</p>

      <p style="margin:0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:bold;">Estimated service range</p>
      <p style="margin:6px 0 8px;font-size:28px;font-weight:bold;color:#0f172a;">' . esc_html($estimate_label) . '</p>
      <p style="margin:0;font-size:14px;color:#475569;">' . (int) $maybe_count . ' marginal · ' . (int) $bad_count . ' need replacement</p>

      ' . $items_html . '

      <p style="margin:24px 0 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:bold;">Total estimate</p>
      <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#0f172a;">' . esc_html($estimate_label) . '</p>

      ' . $interest_html . '
      ' . $equipment_html . '

      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;font-style:italic;">All price estimates are for informational purposes only and are subject to change.</p>

      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;">
        <a href="https://www.rede.ag" style="color:#e21313;text-decoration:underline;font-weight:bold;">www.rede.ag</a><br />
        <a href="mailto:sales@gorede.com" style="color:#64748b;text-decoration:none;">sales@gorede.com</a>
      </p>
    </div>
  </div>
</body>
</html>';
}

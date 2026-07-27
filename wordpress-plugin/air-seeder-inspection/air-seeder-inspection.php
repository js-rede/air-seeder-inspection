<?php
/**
 * Plugin Name: Air Seeder Inspection
 * Description: Embeds the Red E air seeder inspection React app. Use shortcode [air_seeder_inspection].
 * Version: 1.0.0
 * Author: Red E
 */

if (!defined('ABSPATH')) {
   exit;
}

define('ASI_PLUGIN_FILE', __FILE__);
define('ASI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ASI_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Register shortcode and enqueue assets when the shortcode is rendered.
 */
add_shortcode('air_seeder_inspection', 'asi_render_shortcode');

/**
 * Render mount point for the React app.
 *
 * Deploy the Vite `dist/` folder next to this PHP file:
 *   air-seeder-inspection/
 *     air-seeder-inspection.php
 *     dist/
 *       assets/app.js
 *       assets/index.css
 *       data/inspection-steps.json
 */
function asi_render_shortcode() {
   asi_enqueue_assets();

   $steps_url = esc_url(ASI_PLUGIN_URL . 'data/inspection-steps.json');

   return sprintf(
      '<div id="air-seeder-inspection-root" data-steps-url="%s"></div>',
      $steps_url
   );
}

/**
 * Enqueue built JS/CSS once per request.
 */
function asi_enqueue_assets() {
   static $enqueued = false;

   if ($enqueued) {
      return;
   }

   $enqueued = true;

   $css_rel = 'dist/assets/index.css';
   $js_rel  = 'dist/assets/app.js';
   $css_path = ASI_PLUGIN_DIR . $css_rel;
   $js_path  = ASI_PLUGIN_DIR . $js_rel;

   if (file_exists($css_path)) {
      wp_enqueue_style(
         'air-seeder-inspection',
         ASI_PLUGIN_URL . $css_rel,
         array(),
         (string) filemtime($css_path)
      );
   }

   if (file_exists($js_path)) {
      wp_enqueue_script(
         'air-seeder-inspection',
         ASI_PLUGIN_URL . $js_rel,
         array(),
         (string) filemtime($js_path),
         true
      );

      // Vite build is an ES module.
      wp_script_add_data('air-seeder-inspection', 'type', 'module');

      $steps_url = ASI_PLUGIN_URL . 'data/inspection-steps.json';
      wp_add_inline_script(
         'air-seeder-inspection',
         'window.ASI_STEPS_URL = ' . wp_json_encode($steps_url) . ';',
         'before'
      );
   }
}

/**
 * Ensure the script tag gets type="module" even on older WordPress builds.
 */
add_filter('script_loader_tag', 'asi_script_module_type', 10, 3);

function asi_script_module_type($tag, $handle, $src) {
   if ($handle !== 'air-seeder-inspection') {
      return $tag;
   }

   if (strpos($tag, 'type="module"') !== false || strpos($tag, "type='module'") !== false) {
      return $tag;
   }

   return str_replace('<script ', '<script type="module" ', $tag);
}

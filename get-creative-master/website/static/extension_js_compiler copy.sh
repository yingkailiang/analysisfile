#!/bin/bash
cd "$( cd "$( dirname "$0" )" && pwd )"
java -jar compiler.jar --js "js/ga.js" "js/jquery-1.8.2.min.js" "js/jquery-ui-1.9.2.custom.min.js" "js/jquery.path.js" "js/jquery.webcam.js" "js/jquery.autosize.js" "js/animations.js" "js/feedback.js" "js/storage.js" "js/tools/tool.js" "js/tools/textarea.js" "js/tools/collager.js" "js/tools/harmony.js" "js/tools/webcam.js" "js/tools/shapes.js" "js/tools/rectangles.js" "js/pages.js" "js/get_creative.js" "js/extension_only.js" "js/init.js" --js_output_file js/extension.min.js

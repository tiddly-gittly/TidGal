/* eslint-disable @typescript-eslint/no-unsafe-assignment */
(function tidgalWidgetIIFE() {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!$tw.browser) {
    return;
  }
  // separate the widget from the exports here, so we can skip the require of react code if `!$tw.browser`. Those ts code will error if loaded in the nodejs side.
  // prevent error like `ReferenceError: AudioContext is not defined`
  try {
    const components = require('$:/plugins/linonetwo/tidgal/widget/index.js');
    const { galgame } = components;
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    exports.galgame = galgame;
  } catch (error) {
    console.error('Error loading galgame widget', error);
  }
})();

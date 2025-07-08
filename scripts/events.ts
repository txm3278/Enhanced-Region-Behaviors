export const registerClickEvent = () => {
  const origClickLeft =
    // eslint-disable-next-line @typescript-eslint/dot-notation
    foundry.canvas.layers.TokenLayer.prototype['_onClickLeft'];
  // eslint-disable-next-line @typescript-eslint/dot-notation
  foundry.canvas.layers.TokenLayer.prototype['_onClickLeft'] = function (
    event
  ) {
    origClickLeft.call(this, event);
    const clickCoords = event.interactionData.origin;
    if (!clickCoords) {
      console.warn('No click coordinates found in event:', event);
      return;
    }
    const regionsClicked = canvas?.scene?.regions.filter((region) =>
      region.testPoint({
        x: clickCoords.x,
        y: clickCoords.y,
        elevation: region.elevation.bottom ?? 0,
      })
    );
    regionsClicked?.forEach(
      (region) =>
        // eslint-disable-next-line @typescript-eslint/dot-notation
        void region['_handleEvent']({
          name: 'regionClicked',
          data: {},
          region,
          user:
            game.user ??
            (() => {
              throw new Error('No active user found.');
            })(),
        })
    );
  };

  const origCreateEventsField =
    // eslint-disable-next-line @typescript-eslint/dot-notation
    foundry.data.regionBehaviors.RegionBehaviorType['_createEventsField'];
  // eslint-disable-next-line @typescript-eslint/dot-notation
  foundry.data.regionBehaviors.RegionBehaviorType['_createEventsField'] =
    function ({ events, initial } = {}) {
      const field = origCreateEventsField.call(this, { events, initial });
      if (
        game.settings?.get('enhanced-region-behavior', 'globalOnClick') ||
        events?.includes('regionClicked')
      ) {
        if (
          field.element.choices &&
          typeof field.element.choices === 'object' &&
          !Array.isArray(field.element.choices)
        ) {
          (field.element.choices as Record<string, string>)['regionClicked'] =
            game.i18n?.localize(
              'enhanced-region-behavior.regionClickedLabel'
            ) ?? 'Region Clicked';
        }
      }
      return field;
    };
};

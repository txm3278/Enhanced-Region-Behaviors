export const registerClickEvent = () => {
  // @ts-expect-error purposfully extending the prototype
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const origClickLeft = foundry.canvas.layers.TokenLayer.prototype._onClickLeft;
  // @ts-expect-error purposfully extending the prototype
  foundry.canvas.layers.TokenLayer.prototype._onClickLeft = function (event) {
    origClickLeft.call(this, event);
    const clickCoords = event.interactionData.origin;
    const regionsClicked = canvas?.scene?.regions.filter((region) =>
      region.testPoint({ ...clickCoords, elevation: region.elevation.bottom })
    );
    regionsClicked?.forEach(
      (region) =>
        // @ts-expect-error purposfully extending the prototype
        void region._handleEvent({
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
    // @ts-expect-error purposfully extending the prototype
    // eslint-disable-next-line @typescript-eslint/unbound-method
    foundry.data.regionBehaviors.RegionBehaviorType._createEventsField;
  // @ts-expect-error purposfully extending the prototype
  foundry.data.regionBehaviors.RegionBehaviorType._createEventsField =
    function ({ events, initial } = {}) {
      const field = origCreateEventsField.call(this, { events, initial });
      if (events?.includes('regionClicked')) {
        if (
          field.element.choices &&
          typeof field.element.choices === 'object' &&
          !Array.isArray(field.element.choices)
        ) {
          field.element.choices.regionClicked =
            game.i18n?.localize(
              'enhanced-region-behavior.regionClickedLabel'
            ) ?? 'Region Clicked';
        }
      }
      return field;
    };
};

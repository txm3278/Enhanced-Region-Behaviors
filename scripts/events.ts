export const registerClickEvent = () => {
  const origClickLeft = foundry.canvas.layers.TokenLayer.prototype._onClickLeft;

  foundry.canvas.layers.TokenLayer.prototype._onClickLeft = function (event) {
    origClickLeft.call(this, event);
    const clickCoords = event.interactionData.origin;
    const regionsClicked = canvas.scene.regions.filter((region) =>
      region.testPoint({ ...clickCoords, elevation: region.elevation.bottom })
    );
    regionsClicked.forEach((region) =>
      region._handleEvent({
        name: 'regionClicked',
        data: {},
        region,
        user: game.user,
      })
    );
  };

  const origCreateEventsField =
    foundry.data.regionBehaviors.RegionBehaviorType._createEventsField;

  foundry.data.regionBehaviors.RegionBehaviorType._createEventsField =
    function ({ events, initial } = {}) {
      const field = origCreateEventsField.call(this, { events, initial });
      if (events?.includes('regionClicked')) {
        field.element.choices.regionClicked = game.i18n?.localize(
          'enhanced-region-behavior.regionClickedLabel'
        );
      }
      return field;
    };
};

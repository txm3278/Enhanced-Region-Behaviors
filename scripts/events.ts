import { libWrapper } from './libWrapper/shim.js';

export const registerClickEvent = () => {
  const typedLibWrapper = libWrapper as unknown as typeof globalThis.libWrapper;
  typedLibWrapper.register(
    'enhanced-region-behavior',
    'foundry.canvas.layers.TokenLayer.prototype._onClickLeft',
    function (wrapped, ...args) {
      const event = args[0] as foundry.canvas.Canvas.Event.Pointer;
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
            data: {
              token:
                canvas?.tokens?.controlled[0] ??
                canvas?.tokens?.ownedTokens[0] ??
                null,
            },
            region,
            user:
              game.user ??
              (() => {
                throw new Error('No active user found.');
              })(),
          })
      );
      return wrapped(...args);
    },
    'WRAPPER'
  );

  typedLibWrapper.register(
    'enhanced-region-behavior',
    'foundry.data.regionBehaviors.RegionBehaviorType._createEventsField',
    function (wrapped, ...args) {
      const field = wrapped(
        ...args
      ) as foundry.data.regionBehaviors.RegionBehaviorType.EventsField;
      const events = args[0] as string[] | undefined;
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
    },
    'WRAPPER'
  );
};

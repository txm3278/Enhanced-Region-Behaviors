export function registerSettings() {
  game.settings?.register('enhanced-region-behavior', 'globalOnClick', {
    name: game.i18n?.localize(
      'enhanced-region-behavior.Settings.globalOnChangeName'
    ),
    hint: game.i18n?.localize(
      'enhanced-region-behavior.Settings.globalOnChangeHint'
    ),
    scope: 'world',
    config: true,
    requiresReload: true,
    type: Boolean,
    default: false,
  });
}

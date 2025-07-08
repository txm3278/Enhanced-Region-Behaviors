export function registerSettings() {
  game.settings?.register('enhanced-region-behavior', 'globalOnClick', {
    name: game.i18n?.localize(
      'enhanced-region-behavior.Settings.globalOnClickName'
    ),
    hint: game.i18n?.localize(
      'enhanced-region-behavior.Settings.globalOnClickHint'
    ),
    scope: 'world',
    config: true,
    requiresReload: true,
    type: Boolean,
    default: false,
  });
}

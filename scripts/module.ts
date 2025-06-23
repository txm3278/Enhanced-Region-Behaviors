import { TrapRegionBehaviorType } from './regionBehaviors/trapRegionBehaviorType.ts';
import { MusicRegionBehaviorType } from './regionBehaviors/musicRegionBehaviorType.ts';
import { SoundEffectRegionBehaviorType } from './regionBehaviors/soundEffectRegionBehaviorType.ts';
import { VisualEffectRegionBehaviorType } from './regionBehaviors/visualEffectRegionBehaviorType.ts';
import { ElevationRegionBehaviorType } from './regionBehaviors/elevationRegionBehaviorType.ts';
import { registerClickEvent } from './events.ts';

const TRAP_TYPE = 'enhanced-region-behavior.Trap';
const MUSIC_TYPE = 'enhanced-region-behavior.Music';
const SOUND_EFFECT_TYPE = 'enhanced-region-behavior.SoundEffect';
const VISUAL_EFFECT_TYPE = 'enhanced-region-behavior.VisualEffect';
const ELEVATION_TYPE = 'enhanced-region-behavior.Elevation';

Hooks.once('init', () => {
  console.log('enhanced-region-behavior | Initializing Trap Region Behavior');
  registerClickEvent();
  if (game.system?.id === 'dnd5e') {
    CONFIG.RegionBehavior.dataModels[TRAP_TYPE] = TrapRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[TRAP_TYPE] = 'fa-solid fa-triangle-exclamation';
  } else {
    // @ts-expect-error Created by foundry
    delete game.model?.RegionBehavior[TRAP_TYPE];
  }

  CONFIG.RegionBehavior.dataModels[MUSIC_TYPE] = MusicRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[MUSIC_TYPE] = 'fa-solid fa-music';
  CONFIG.RegionBehavior.dataModels[SOUND_EFFECT_TYPE] =
    SoundEffectRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[SOUND_EFFECT_TYPE] =
    'fa-solid fa-volume-high';
  if (game.modules?.get('sequencer')?.active) {
    CONFIG.RegionBehavior.dataModels[VISUAL_EFFECT_TYPE] =
      VisualEffectRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[VISUAL_EFFECT_TYPE] =
      'fa-solid fa-wand-magic-sparkles';
  } else {
    // @ts-expect-error Created by foundry
    delete game.model?.RegionBehavior[VISUAL_EFFECT_TYPE];
  }
  CONFIG.RegionBehavior.dataModels[ELEVATION_TYPE] = ElevationRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[ELEVATION_TYPE] = 'fa-solid fa-arrow-up-from-ground-water';
});

Hooks.once('i18nInit', () => {
  foundry.helpers.Localization.localizeDataModel(TrapRegionBehaviorType);
});

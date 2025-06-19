import { TrapRegionBehaviorType } from './regionBehaviors/trapRegionBehaviorType.ts';
import { MusicRegionBehaviorType } from './regionBehaviors/musicRegionBehaviorType.ts';
import { SoundEffectRegionBehaviorType } from './regionBehaviors/soundEffectRegionBehaviorType.ts';
import { VisualEffectRegionBehaviorType } from './regionBehaviors/visualEffectRegionBehaviorType.ts';
import { registerClickEvent } from './events.ts';

const TYPE = 'enhanced-region-behavior.Trap';
const MUSIC_TYPE = 'enhanced-region-behavior.Music';
const SOUND_EFFECT_TYPE = 'enhanced-region-behavior.SoundEffect';
const VISUAL_EFFECT_TYPE = 'enhanced-region-behavior.VisualEffect';

Hooks.once('init', () => {
  console.log('enhanced-region-behavior | Initializing Trap Region Behavior');
  registerClickEvent();
  if (game.system?.id === 'dnd5e') {
    CONFIG.RegionBehavior.dataModels[TYPE] = TrapRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[TYPE] = 'fa-solid fa-triangle-exclamation';
  } else {
    // @ts-expect-error Created by foundry
    delete game.model?.RegionBehavior[TYPE];
  }

  CONFIG.RegionBehavior.dataModels[MUSIC_TYPE] = MusicRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[MUSIC_TYPE] = 'fa-solid fa-music';
  CONFIG.RegionBehavior.dataModels[SOUND_EFFECT_TYPE] =
    SoundEffectRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[SOUND_EFFECT_TYPE] =
    'fa-solid fa-volume-high';
  CONFIG.RegionBehavior.dataModels[VISUAL_EFFECT_TYPE] =
    VisualEffectRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[VISUAL_EFFECT_TYPE] =
    'fa-solid fa-volume-high';
});

Hooks.once('i18nInit', () => {
  foundry.helpers.Localization.localizeDataModel(TrapRegionBehaviorType);
});

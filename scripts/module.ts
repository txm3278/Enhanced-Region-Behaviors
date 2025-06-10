import { TrapRegionBehaviorType } from './regionBehaviors/trapRegionBehaviorType.ts';
import { MusicRegionBehaviorType } from './regionBehaviors/musicRegionBehaviorType.ts';
import { SoundEffectRegionBehaviorType } from './regionBehaviors/soundEffectRegionBehaviorType.ts';

const TYPE = 'enhanced-region-behavior.Trap';
const MUSIC_TYPE = 'enhanced-region-behavior.Music';
const SOUND_EFFECT_TYPE = 'enhanced-region-behavior.SoundEffect';

Hooks.once('init', () => {
  console.log('enhanced-region-behavior | Initializing Trap Region Behavior');
  CONFIG.RegionBehavior.dataModels[TYPE] = TrapRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[TYPE] = 'fa-solid fa-triangle-exclamation';
  CONFIG.RegionBehavior.dataModels[MUSIC_TYPE] = MusicRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[MUSIC_TYPE] = 'fa-solid fa-music';
  CONFIG.RegionBehavior.dataModels[SOUND_EFFECT_TYPE] = SoundEffectRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[SOUND_EFFECT_TYPE] = 'fa-solid fa-music';
});

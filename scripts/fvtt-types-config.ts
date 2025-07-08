import { TrapRegionBehaviorType } from './regionBehaviors/trapRegionBehaviorType.ts';
import { MusicRegionBehaviorType } from './regionBehaviors/musicRegionBehaviorType.ts';
import { SoundEffectRegionBehaviorType } from './regionBehaviors/soundEffectRegionBehaviorType.ts';
import { VisualEffectRegionBehaviorType } from './regionBehaviors/visualEffectRegionBehaviorType.ts';
import { ElevationRegionBehaviorType } from './regionBehaviors/elevationRegionBehaviorType.ts';

declare module 'fvtt-types/configuration' {
  interface SettingConfig {
    'enhanced-region-behavior.globalOnClick': boolean;
  }
  interface DataModelConfig {
    RegionBehavior: {
      'enhanced-region-behavior.trap'?: typeof TrapRegionBehaviorType;
      'enhanced-region-behavior.music': typeof MusicRegionBehaviorType;
      'enhanced-region-behavior.soundEffect': typeof SoundEffectRegionBehaviorType;
      'enhanced-region-behavior.visualEffect'?: typeof VisualEffectRegionBehaviorType;
      'enhanced-region-behavior.elevation': typeof ElevationRegionBehaviorType;
    };
  }
}

export {};

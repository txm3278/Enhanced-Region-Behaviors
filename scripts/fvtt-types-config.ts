import { TrapRegionBehaviorType } from './regionBehaviors/trapRegionBehaviorType.ts';
import {
  MusicRegionBehaviorType,
  handleMusicRegion,
} from './regionBehaviors/musicRegionBehaviorType.ts';
import { SoundEffectRegionBehaviorType } from './regionBehaviors/soundEffectRegionBehaviorType.ts';
import { VisualEffectRegionBehaviorType } from './regionBehaviors/visualEffectRegionBehaviorType.ts';
import { ElevationRegionBehaviorType } from './regionBehaviors/elevationRegionBehaviorType.ts';
import { JournalRegionBehaviorType } from './regionBehaviors/journalRegionBehaviorType.ts';

declare module 'fvtt-types/configuration' {
  interface SettingConfig {
    'enhanced-region-behavior.globalOnClick': boolean;
  }
  interface DataModelConfig {
    RegionBehavior: {
      'enhanced-region-behavior.Trap'?: typeof TrapRegionBehaviorType;
      'enhanced-region-behavior.Music': typeof MusicRegionBehaviorType;
      'enhanced-region-behavior.SoundEffect': typeof SoundEffectRegionBehaviorType;
      'enhanced-region-behavior.VisualEffect'?: typeof VisualEffectRegionBehaviorType;
      'enhanced-region-behavior.Elevation': typeof ElevationRegionBehaviorType;
      'enhanced-region-behavior.Journal': typeof JournalRegionBehaviorType;
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace CONFIG {
    interface Queries {
      'enhanced-region-behavior.handleMusicRegion': typeof handleMusicRegion;
    }
  }
}

export {};

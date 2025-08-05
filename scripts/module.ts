import { TrapRegionBehaviorType } from './regionBehaviors/trapRegionBehaviorType.ts';
import {
  MusicRegionBehaviorType,
  handleMusicRegion,
} from './regionBehaviors/musicRegionBehaviorType.ts';
import { SoundEffectRegionBehaviorType } from './regionBehaviors/soundEffectRegionBehaviorType.ts';
import { VisualEffectRegionBehaviorType } from './regionBehaviors/visualEffectRegionBehaviorType.ts';
import { ElevationRegionBehaviorType } from './regionBehaviors/elevationRegionBehaviorType.ts';
import { JournalRegionBehaviorType } from './regionBehaviors/journalRegionBehaviorType.ts';
import { TriggerActionRegionBehaviorType } from './regionBehaviors/triggerActionRegionBehaviorType.ts';
import { registerClickEvent } from './events.ts';
import { registerSettings } from './settings.ts';
import { updateTargets, itemUse } from './utils.ts';

const TRAP_TYPE = 'enhanced-region-behavior.Trap';
const MUSIC_TYPE = 'enhanced-region-behavior.Music';
const SOUND_EFFECT_TYPE = 'enhanced-region-behavior.SoundEffect';
const VISUAL_EFFECT_TYPE = 'enhanced-region-behavior.VisualEffect';
const ELEVATION_TYPE = 'enhanced-region-behavior.Elevation';
const JOURNAL_TYPE = 'enhanced-region-behavior.Journal';
const TRIGGER_ACTION_TYPE = 'enhanced-region-behavior.TriggerAction';

const registerQueries = () => {
  CONFIG.queries['enhanced-region-behavior.handleMusicRegion'] =
    handleMusicRegion;
  CONFIG.queries['enhanced-region-behavior.updateTargets'] = updateTargets;
  CONFIG.queries['enhanced-region-behavior.itemUse'] = itemUse;
};

Hooks.once('init', () => {
  registerSettings();
  console.log(
    'enhanced-region-behavior | Initializing Enhanced Region Behaviors'
  );
  registerClickEvent();
  registerQueries();

  if (game.system?.id === 'dnd5e') {
    CONFIG.RegionBehavior.dataModels[TRAP_TYPE] = TrapRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[TRAP_TYPE] =
      'fa-solid fa-triangle-exclamation';
    CONFIG.RegionBehavior.dataModels[TRIGGER_ACTION_TYPE] =
      TriggerActionRegionBehaviorType;
    CONFIG.RegionBehavior.typeIcons[TRIGGER_ACTION_TYPE] =
      'fa-solid fa-hand-sparkles';
  } else {
    delete game.model?.RegionBehavior[TRAP_TYPE];
    delete game.model?.RegionBehavior[TRIGGER_ACTION_TYPE];
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
    delete game.model?.RegionBehavior[VISUAL_EFFECT_TYPE];
  }
  CONFIG.RegionBehavior.dataModels[ELEVATION_TYPE] =
    ElevationRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[ELEVATION_TYPE] =
    'fa-solid fa-arrow-up-from-ground-water';
  CONFIG.RegionBehavior.dataModels[JOURNAL_TYPE] = JournalRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[JOURNAL_TYPE] = 'fa-solid fa-book-open';
});

Hooks.once('i18nInit', () => {
  foundry.helpers.Localization.localizeDataModel(TrapRegionBehaviorType);
  foundry.helpers.Localization.localizeDataModel(MusicRegionBehaviorType);
  foundry.helpers.Localization.localizeDataModel(SoundEffectRegionBehaviorType);
  foundry.helpers.Localization.localizeDataModel(
    VisualEffectRegionBehaviorType
  );
  foundry.helpers.Localization.localizeDataModel(ElevationRegionBehaviorType);
  foundry.helpers.Localization.localizeDataModel(JournalRegionBehaviorType);
  foundry.helpers.Localization.localizeDataModel(
    TriggerActionRegionBehaviorType
  );
});

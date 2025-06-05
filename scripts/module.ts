import { TrapRegionBehaviorType } from './regionBehaviors/trapRegionBehaviorType.ts';
const TYPE = 'enhanced-region-behavior.Trap';
Hooks.once('init', () => {
  console.log('enhanced-region-behavior | Initializing Trap Region Behavior');
  CONFIG.RegionBehavior.dataModels[TYPE] = TrapRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons[TYPE] = 'fa-solid fa-triangle-exclamation';
});

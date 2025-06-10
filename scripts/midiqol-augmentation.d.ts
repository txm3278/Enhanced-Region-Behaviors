declare global {
  interface Actor {
    rollSavingThrow(options: { ability: string }): Promise<Roll[]>;
  }

  // Add MidiQOL to the global scope
  const MidiQOL: {
    applyTokenDamage(
      damageDetail: { damage: number; type: string }[],
      totalDamage: number,
      theTargets: Set<TokenDocument> | TokenDocument[],
      item: Item | string | null,
      saves: Set<Roll> | Roll[] | null,
      options?: {
        existingDamage?: number[];
        superSavers?: Set<Actor>;
        semiSuperSavers?: Set<Actor>;
        workflow?: MidiQOL.Workflow;
        updateContext?: { onUpdateCalled: boolean };
        forceApply?: boolean;
        noConcentrationCheck?: boolean;
      }
    ): Promise<void>;
  };
}

declare module "fvtt-types/configuration" {
    interface DataModelConfig {
        RegionBehavior: {
            YourType: TrapRegionBehaviorType;
        }
    }
}

export {};

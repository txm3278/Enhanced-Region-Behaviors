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

declare namespace MidiQOL {
  class Workflow {
    constructor(
      actor: Actor,
      item: Item,
      itemCardId: string,
      targetUuids: string[],
      options?: Record<string, unknown>
    );

    actor: Actor;
    item: Item;
    itemCardId: string;
    targets: Set<TokenDocument>;
    hitTargets: Set<TokenDocument>;
    failedSaves: Set<TokenDocument>;
    passedSaves: Set<TokenDocument>;
    damageRoll: Roll | null;
    attackRoll: Roll | null;
    isCritical: boolean;
    isFumble: boolean;
    advantage: boolean;
    disadvantage: boolean;
    options: Record<string, unknown>;
    uuid: string;

    // Methods
    next(): Promise<void>;
    complete(): Promise<void>;
    applyDamage(
      damageDetail: { damage: number; type: string }[],
      totalDamage: number,
      targets: Set<TokenDocument> | TokenDocument[],
      options?: Record<string, unknown>
    ): Promise<void>;
  }
}

export {};

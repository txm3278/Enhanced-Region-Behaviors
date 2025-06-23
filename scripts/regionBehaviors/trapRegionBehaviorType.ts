const DND_ABILITY_SCORES = {
  str: 'str',
  dex: 'dex',
  con: 'con',
  int: 'int',
  wis: 'wis',
  cha: 'cha',
};
const DND_DAMAGE_TYPES = {
  acid: 'acid',
  bludgeoning: 'bludgeoning',
  cold: 'cold',
  fire: 'fire',
  force: 'force',
  lightning: 'lightning',
  necrotic: 'necrotic',
  piercing: 'piercing',
  poison: 'poison',
  psychic: 'psychic',
  radiant: 'radiant',
  slashing: 'slashing',
  thunder: 'thunder',
};

const trapSchema = () => {
  return {
    automateDamage: new foundry.data.fields.BooleanField({
      required: true,
      initial: true,
    }),
    saveDC: new foundry.data.fields.NumberField({
      required: true,
      initial: 15,
    }),
    saveAbility: new foundry.data.fields.StringField({
      required: true,
      initial: 'dex',
      choices: DND_ABILITY_SCORES, // Only allow DND ability scores
    }),
    damage: new foundry.data.fields.StringField({
      required: true,
      initial: '2d6',
    }),
    savedDamage: new foundry.data.fields.StringField({
      required: true,
      initial: '1d6',
    }),
    damageType: new foundry.data.fields.StringField({
      required: true,
      initial: 'piercing',
      choices: DND_DAMAGE_TYPES, // Only allow DND damage types
    }),
    saveFailedMessage: new foundry.data.fields.StringField({
      required: true,
      initial: game.i18n?.localize(
        'enhanced-region-behavior.TrapDamageMessage'
      ),
    }),
    saveSucceededMessage: new foundry.data.fields.StringField({
      required: true,
      initial: game.i18n?.localize(
        'enhanced-region-behavior.TrapAvoidedMessage'
      ),
    }),
    disableAfterTrigger: new foundry.data.fields.BooleanField({
      required: true,
      initial: true,
    }),
  };
};

type trapSchema = ReturnType<typeof trapSchema>;

export class TrapRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<trapSchema> {
  static LOCALIZATION_PREFIXES = ['enhanced-region-behavior.Regions.Trap'];

  static defineSchema() {
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.TOKEN_ENTER,
          CONST.REGION_EVENTS.TOKEN_EXIT,
          CONST.REGION_EVENTS.TOKEN_ANIMATE_IN,
          CONST.REGION_EVENTS.TOKEN_ANIMATE_OUT,
          CONST.REGION_EVENTS.TOKEN_MOVE_IN,
          CONST.REGION_EVENTS.TOKEN_MOVE_OUT,
          CONST.REGION_EVENTS.TOKEN_MOVE_WITHIN,
          CONST.REGION_EVENTS.TOKEN_TURN_START,
          CONST.REGION_EVENTS.TOKEN_TURN_END,
          CONST.REGION_EVENTS.TOKEN_ROUND_START,
          CONST.REGION_EVENTS.TOKEN_ROUND_END,
        ],
      }),
      ...trapSchema(),
    };
  }

  async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    const token = (event.data as { token?: TokenDocument | null }).token;
    if (!token?.actor) return;

    const actor = token.actor as Actor.Known;
    if (!(actor.type === 'character' || actor.type === 'npc')) {
      console.warn(
        `TrapRegionBehaviorType: Actor ${actor.name} (${actor.id}) is not a character or NPC. Skipping trap behavior.`
      );
      return;
    }

    // Check if MidiQOL is active
    const midiQOLActive = !!game.modules?.get('midi-qol')?.active;

    // Roll saving throw
    let saveTotal = 0;
    if (midiQOLActive && typeof actor.rollSavingThrow === 'function') {
      const saveRoll = await actor.rollSavingThrow({
        ability: this.saveAbility,
      });
      saveTotal = saveRoll?.[0]?.total ?? 0;
    } else if (actor.system?.abilities?.[this.saveAbility]?.save) {
      // Core dnd5e roll
      const ability = this.saveAbility;
      const saveData = actor.system.abilities[ability];
      const roll = await new Roll('1d20 + @mod + @prof', {
        mod: saveData.mod,
        prof: saveData.proficient ? actor.system.attributes.prof : 0,
      }).roll();
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ token }),
        flavor: `${this.saveAbility} ${game.i18n?.localize(
          'enhanced-region-behavior.TrapSavingThrowMessage'
        )}`,
      });
      saveTotal = roll.total ?? 0;
    } else {
      // Fallback: just roll 1d20
      const roll = await new Roll('1d20').roll();
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ token }),
        flavor: `${this.saveAbility} ${game.i18n?.localize(
          'enhanced-region-behavior.TrapSavingThrowMessage'
        )}`,
      });
      saveTotal = roll.total ?? 0;
    }

    const saved = saveTotal > (this.saveDC ?? 0);
    const damageRoll = await new Roll(
      saved ? this.savedDamage : this.damage
    ).roll();

    await damageRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ token }),
      flavor: game.i18n?.localize(
        'enhanced-region-behavior.TrapDamageRollMessage'
      ),
    });

    if (this.automateDamage && damageRoll.total > 0) {
      if (midiQOLActive && typeof MidiQOL?.applyTokenDamage === 'function') {
        await MidiQOL.applyTokenDamage(
          [{ damage: damageRoll.total, type: this.damageType }],
          damageRoll.total,
          new Set([token]),
          null,
          null
        );
      } else {
        // Core Foundry/dnd5e damage application
        await actor.applyDamage?.([
          {
            value: damageRoll.total,
            type: this.damageType,
            properties: new Set(),
          },
        ]);
      }
    }

    void ChatMessage.create({
      content: this.interpolate(
        saved ? this.saveSucceededMessage : this.saveFailedMessage,
        {
          name: token.name,
          damage: damageRoll.total.toString(),
          type: this.damageType,
        }
      ),
      speaker: ChatMessage.getSpeaker({ token }),
    });

    if (this.disableAfterTrigger) {
      await this.parent.update({ disabled: true });
    }
  }

  interpolate(template: string, data: Record<string, string>) {
    return template.replace(/{(\w+)}/g, (fullMatch, key: string) => {
      return key in data ? data[key] : fullMatch;
    });
  }
}

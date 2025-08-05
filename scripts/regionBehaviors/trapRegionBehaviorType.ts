const trapSchema = {
  automateDamage: new foundry.data.fields.BooleanField({
    required: true,
    initial: true,
  }),
  saveDC: new foundry.data.fields.NumberField({
    required: true,
    initial: 15,
  }),
  saveAbility: new foundry.data.fields.SetField(
    new foundry.data.fields.StringField({
      initial: 'dex',
      required: false,
      choices: () =>
        Object.keys(CONFIG.DND5E.abilities).reduce((acc, key) => {
          acc[key] = CONFIG.DND5E.abilities[key].abbreviation;
          return acc;
        }, {}),
    })
  ),
  skillChecks: new foundry.data.fields.SetField(
    new foundry.data.fields.StringField({
      required: false,
      choices: () =>
        Object.keys(CONFIG.DND5E.skills).reduce((acc, key) => {
          acc[key] = CONFIG.DND5E.skills[key].label;
          return acc;
        }, {}),
    })
  ),
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
    initial: 'Piercing',
    choices: () =>
      Object.keys(CONFIG.DND5E.damageTypes).reduce((acc, key) => {
        acc[key] = CONFIG.DND5E.damageTypes[key].label;
        return acc;
      }, {}), // Only allow DND damage types
  }),
  saveFailedMessage: new foundry.data.fields.StringField({
    required: true,
    initial: () =>
      game.i18n?.localize(
        'enhanced-region-behavior.Regions.Trap.TrapDamageMessage'
      ),
  }),
  saveSucceededMessage: new foundry.data.fields.StringField({
    required: true,
    initial: () =>
      game.i18n?.localize(
        'enhanced-region-behavior.Regions.Trap.TrapAvoidedMessage'
      ),
  }),
  triggerBehaviorOnSave: new foundry.data.fields.SetField(
    new foundry.data.fields.DocumentUUIDField({
      type: 'RegionBehavior',
      required: false,
    })
  ),
  triggerBehaviorOnFail: new foundry.data.fields.SetField(
    new foundry.data.fields.DocumentUUIDField({
      type: 'RegionBehavior',
      required: false,
    })
  ),
};

export class TrapRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<typeof trapSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.Trap',
  ];

  static override defineSchema() {
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
      ...trapSchema,
    };
  }

  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    // Ensure the gm handles the event
    if (!event.user.isSelf) return;

    const token = (event.data as { token?: TokenDocument | null }).token;
    if (!token?.actor) return;

    const actor = token.actor as Actor.Known;
    if (!(actor.type === 'character' || actor.type === 'npc')) {
      console.warn(
        `TrapRegionBehaviorType: Actor ${actor.name} (${
          actor.id ?? ''
        }) is not a character or NPC. Skipping trap behavior.`
      );
      return;
    }

    // Check if MidiQOL is active
    const midiQOLActive = game.modules?.get('midi-qol')?.active;
    let saveTotal = 0;
    if (this.saveAbility.size > 0) {
      let result;
      if (this.saveAbility.size > 1) {
        result = await foundry.applications.api.DialogV2.wait({
          window: {
            title: game.i18n?.localize(
              'enhanced-region-behavior.Regions.Trap.TrapDialogTitle'
            ),
          },
          content: game.i18n?.localize(
            'enhanced-region-behavior.Regions.Trap.TrapSaveAbilityContent'
          ),
          buttons: Array.from(this.saveAbility).map((ability) => ({
            label: `${CONFIG.DND5E.abilities[ability].abbreviation} (${
              actor.system.abilities[ability].mod > 0 ? '+' : ''
            }${actor.system.abilities[ability].mod})`,
            action: ability,
          })),
        });
      }
      // Roll saving throw
      const saveRoll = await actor.rollSavingThrow({
        ability: result ?? this.saveAbility.values().next().value,
      });
      saveTotal = saveRoll?.[0]?.total ?? 0;
    } else if (this.skillChecks.size > 0) {
      let result;
      if (this.skillChecks.size > 1) {
        result = await foundry.applications.api.DialogV2.wait({
          window: {
            title: game.i18n?.localize(
              'enhanced-region-behavior.Regions.Trap.TrapDialogTitle'
            ),
          },
          content: game.i18n?.localize(
            'enhanced-region-behavior.Regions.Trap.TrapSkillCheckContent'
          ),
          buttons: Array.from(this.skillChecks).map((skill) => ({
            label: `${CONFIG.DND5E.skills[skill].label} (${
              actor.system.skills[skill].mod > 0 ? '+' : ''
            }${actor.system.skills[skill].mod})`,
            action: skill,
          })),
        });
      }
      // Roll skill check
      const skillRoll = await actor.rollSkill({
        skill: result ?? this.skillChecks.values().next().value,
      });
      saveTotal = skillRoll?.[0]?.total ?? 0;
    }

    const saved = saveTotal > (this.saveDC ?? 0);
    const damageRoll = await new Roll(
      saved ? this.savedDamage : this.damage
    ).roll();

    await damageRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ token }),
      flavor: game.i18n?.localize(
        'enhanced-region-behavior.Regions.Trap.TrapDamageRollMessage'
      ),
    });

    if (this.automateDamage && damageRoll.total > 0) {
      if (midiQOLActive && typeof MidiQOL.applyTokenDamage === 'function') {
        await MidiQOL.applyTokenDamage(
          [{ damage: damageRoll.total, type: this.damageType }],
          damageRoll.total,
          new Set([token]),
          null,
          null
        );
      } else {
        // Core Foundry/dnd5e damage application
        await actor.applyDamage([
          {
            value: damageRoll.total,
            type: this.damageType,
            properties: new Set(),
          },
        ]);
      }
    }

    if (
      (saved && this.saveSucceededMessage) ||
      (!saved && this.saveFailedMessage)
    ) {
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
    }

    if (saved && this.triggerBehaviorOnSave.size > 0) {
      for (const behaviorId of this.triggerBehaviorOnSave) {
        const behavior = await fromUuid<RegionBehavior>(behaviorId);
        if (behavior) {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          await behavior.system['_handleRegionEvent'](event);
        }
      }
    }
    if (!saved && this.triggerBehaviorOnFail.size > 0) {
      for (const behaviorId of this.triggerBehaviorOnFail) {
        const behavior = await fromUuid<RegionBehavior>(behaviorId);
        if (behavior) {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          await behavior.system['_handleRegionEvent'](event);
        }
      }
    }
  }

  interpolate(template: string, data: Record<string, string>) {
    return template.replace(/{(\w+)}/g, (fullMatch, key: string) => {
      return key in data ? data[key] ?? fullMatch : fullMatch;
    });
  }
}

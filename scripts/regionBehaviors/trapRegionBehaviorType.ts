export class TrapRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<foundry.data.fields.DataSchema> {
  static defineSchema() {
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.TOKEN_ENTER,
          CONST.REGION_EVENTS.TOKEN_EXIT,
          CONST.REGION_EVENTS.TOKEN_MOVE_IN,
          CONST.REGION_EVENTS.TOKEN_MOVE_OUT,
          CONST.REGION_EVENTS.TOKEN_TURN_START,
          CONST.REGION_EVENTS.TOKEN_TURN_END,
          CONST.REGION_EVENTS.TOKEN_ROUND_START,
          CONST.REGION_EVENTS.TOKEN_ROUND_END,
        ],
      }),
      damage: new foundry.data.fields.StringField({
        label: game.i18n?.localize('enhanced-region-behavior.TrapDamageLabel'),
        required: true,
        initial: '2d6',
      }),
      saveDC: new foundry.data.fields.NumberField({
        label: game.i18n?.localize('enhanced-region-behavior.TrapSaveDCLabel'),
        required: true,
        initial: 15,
      }),
      saveAbility: new foundry.data.fields.StringField({
        label: game.i18n?.localize(
          'enhanced-region-behavior.TrapSaveAbilityLabel'
        ),
        required: true,
        initial: 'dex',
      }),
      damageType: new foundry.data.fields.StringField({
        label: game.i18n?.localize(
          'enhanced-region-behavior.TrapDamageTypeLabel'
        ),
        required: true,
        initial: 'piercing',
      }),
    };
  }

  async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    const token = (event.data as { token?: TokenDocument | null }).token;
    if (!token?.actor) return;

    const actor = token.actor;

    const saveRoll = await actor.rollSavingThrow({ ability: this.saveAbility });

    if (saveRoll[0].total < this.saveDC) {
      const damageRoll = await new Roll(this.damage).roll();

      await MidiQOL.applyTokenDamage(
        [{ damage: damageRoll.total, type: this.damageType }],
        damageRoll.total,
        new Set([token]),
        null,
        null
      );

      void ChatMessage.create({
        content: game.i18n?.format('enhanced-region-behavior.TrapDamage', {
          name: token.name,
          damage: damageRoll.total.toString(),
          type: this.damageType,
        }),
        speaker: ChatMessage.getSpeaker({ token }),
      });
    } else {
      void ChatMessage.create({
        content: game.i18n?.format('enhanced-region-behavior.TrapAvoided', {
          name: token.name,
        }),
        speaker: ChatMessage.getSpeaker({ token }),
      });
    }
  }
}

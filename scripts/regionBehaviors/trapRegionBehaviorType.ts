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
      damage: new foundry.data.fields.StringField({
        label: game.i18n?.localize('enhanced-region-behavior.TrapDamageLabel'),
        required: true,
        initial: '2d6',
      }),
      savedDamage: new foundry.data.fields.StringField({
        label: game.i18n?.localize(
          'enhanced-region-behavior.TrapSavedDamageLabel'
        ),
        required: true,
        initial: '1d6',
      }),
      damageType: new foundry.data.fields.StringField({
        label: game.i18n?.localize(
          'enhanced-region-behavior.TrapDamageTypeLabel'
        ),
        required: true,
        initial: 'piercing',
      }),
      saveFailedMessage: new foundry.data.fields.StringField({
        label: game.i18n?.localize(
          'enhanced-region-behavior.TrapSaveFailedMessageLabel'
        ),
        required: true,
        initial: '{name} triggered a trap and took {damage} {type} damage!',
      }),
      saveSucceededMessage: new foundry.data.fields.StringField({
        label: game.i18n?.localize(
          'enhanced-region-behavior.TrapSaveSuccessMessageLabel'
        ),
        required: true,
        initial: '{name} avoided the trap and only took half damage!',
      }),
      disableAfterTrigger: new foundry.data.fields.BooleanField({
        label: game.i18n?.localize(
          'enhanced-region-behavior.TrapDisableAfterTriggerLabel'
        ),
        required: true,
        initial: true,
      }),
    };
  }

  async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    const token = (event.data as { token?: TokenDocument | null }).token;
    if (!token?.actor) return;

    const actor = token.actor;

    const saveRoll = await actor.rollSavingThrow({ ability: this.saveAbility });

    if ((saveRoll[0]?.total ?? 0) < this.saveDC) {
      const damageRoll = await new Roll(this.damage).roll();

      await MidiQOL.applyTokenDamage(
        [{ damage: damageRoll.total, type: this.damageType }],
        damageRoll.total,
        new Set([token]),
        null,
        null
      );

      void ChatMessage.create({
        content: this.interpolate(this.saveFailedMessage, {
          name: token.name,
          damage: damageRoll.total.toString(),
          type: this.damageType,
        }),
        speaker: ChatMessage.getSpeaker({ token }),
      });
    } else {
      const savedDamageRoll = await new Roll(this.savedDamage).roll();
      if (savedDamageRoll.total > 0) {
        await MidiQOL.applyTokenDamage(
          [{ damage: savedDamageRoll.total, type: this.damageType }],
          savedDamageRoll.total,
          new Set([token]),
          null,
          null
        );
      }
      void ChatMessage.create({
        content: this.interpolate(this.saveSucceededMessage, {
          name: token.name,
          damage: savedDamageRoll.total.toString(),
          type: this.damageType,
        }),
        speaker: ChatMessage.getSpeaker({ token }),
      });
    }
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

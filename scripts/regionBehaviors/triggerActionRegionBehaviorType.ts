const triggerActionSchema = {
  itemId: new foundry.data.fields.DocumentUUIDField({
    type: 'Item',
    required: false,
  }),
};

export class TriggerActionRegionBehaviorType extends foundry.data
  .regionBehaviors.RegionBehaviorType<typeof triggerActionSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.TriggerAction',
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
          CONST.REGION_EVENTS.TOKEN_TURN_START,
          CONST.REGION_EVENTS.TOKEN_TURN_END,
          CONST.REGION_EVENTS.TOKEN_ROUND_START,
          CONST.REGION_EVENTS.TOKEN_ROUND_END,
        ],
      }),
      ...triggerActionSchema,
    };
  }

  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    if(!game.user?.isGM) return;

    const triggeringToken = (event.data as { token: TokenDocument | null })
      .token;

    // Find the item
    const item: Item.Known | null = await fromUuid(this.itemId);
    if (!item) {
      console.warn(
        'ItemRegionBehaviorType: Item not found for region behavior',
        this.itemId
      );
      return;
    }
    // Determine target
    const targetToken: TokenDocument | null = triggeringToken;

    // Check if MidiQOL is active and use it if available
    const midiQOLActive = game.modules.get('midi-qol')?.active;

    if (midiQOLActive && typeof MidiQOL.completeItemUse === 'function') {
      try {
        // Use MidiQOL for advanced item workflow
        const targets = targetToken ? [targetToken.uuid] : [];
        await MidiQOL.completeItemUse(
          item,
          {midiOptions: {targetUuids: targets, proceedChecks: {none: true}}}
        );
      } catch (error) {
        console.warn('MidiQOL item use failed, falling back to core:', error);
        await this.useCoreItemWorkflow(item, targetToken);
      }
    } else {
      // Use core Foundry item workflow
      await this.useCoreItemWorkflow(item, targetToken);
    }
  }

  private async useCoreItemWorkflow(
    item: Item.Known,
    targetToken: TokenDocument | null
  ) {
    try {
      // Set target if provided
      if (targetToken?.id) {
        const owner = game.users?.find(u => u.character === item.actor) ?? game.users?.activeGM;
        await owner?.query(
          'enhanced-region-behavior.updateTargets',
          [targetToken.id]
        );
        await owner?.query(
          'enhanced-region-behavior.itemUse',
          item.uuid, {createMessage: true,}
        );
      }
    } catch (error) {
      console.error('Failed to use item:', error);
    }
  }
}

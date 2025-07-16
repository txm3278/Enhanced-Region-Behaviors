const journalSchema = {
  journalId: new foundry.data.fields.StringField({
    required: true,
    initial: '',
  }),
  journalName: new foundry.data.fields.StringField({
    required: false,
    initial: '',
  }),
  journalPageId: new foundry.data.fields.StringField({
    required: false,
    initial: '',
  }),
  showToAll: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
  }),
};

export class JournalRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<typeof journalSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.Journal',
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
          'regionClicked',
        ],
      }),
      ...journalSchema,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    if (!event.user.isSelf) return;

    let document;
    const collection = game.collections?.get('JournalEntry');

    // First try to find by ID if provided
    if (this.journalId) {
      document = collection?.get(this.journalId);
    } else if (this.journalName) {
      // If not found by ID and name is provided, search by name
      document = collection?.getName(this.journalName);
    }

    if (!document) {
      const identifier = this.journalId || this.journalName || 'unknown';
      ui.notifications?.warn(`Document not found: "${identifier}"`);
      return;
    }

    // Handle different document types
    const journal = document as JournalEntry.Implementation;
    let page;
    // If a specific page is requested, try to show that page
    if (this.journalPageId) {
      page = journal.pages.getName(this.journalPageId);
    }

    if (this.showToAll) {
      game.socket?.emit('showEntry', page?.uuid ?? journal.uuid, {
        force: true,
      });
    }
    game.socket?.emit('showEntry', page?.uuid ?? journal.uuid, {
      force: true,
      users: [event.user.id],
    });
  }
}

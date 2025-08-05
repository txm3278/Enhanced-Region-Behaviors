const journalSchema = {
  journalId: new foundry.data.fields.DocumentUUIDField({
    type: 'JournalEntry',
    required: false,
  }),
  journalName: new foundry.data.fields.StringField({
    required: false,
    initial: '',
  }),
  journalPageId: new foundry.data.fields.DocumentUUIDField({
    type: 'JournalEntryPage',
    required: false,
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

  static override migrateData(source: {
    journalId?: string;
    journalName?: string;
    journalPageId?: string;
  }) {
    if (source.journalId && !source.journalId.includes('JournalEntry')) {
      source.journalId = `JournalEntry.${source.journalId}`;
    }

    if (
      source.journalPageId &&
      !source.journalPageId.includes('JournalEntryPage')
    ) {
      source.journalPageId = `${source.journalId ?? ''}${
        source.journalId ? '.' : ''
      }JournalEntryPage.${source.journalPageId}`;
    }
    return source;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    if (!event.user.isSelf) return;

    let document;
    const collection = game.collections?.get('JournalEntry');

    // First try to find by ID if provided
    if (!this.journalId && this.journalName) {
      // If not found by ID and name is provided, search by name
      document = collection?.getName(this.journalName);
    }
    if (!document || this.journalId) {
      document = this.journalId;
    } else {
      document = document.uuid;
    }

    if (!document && !this.journalPageId) {
      const identifier = (this.journalId ?? this.journalName) ?? 'unknown';
      ui.notifications?.warn(`Document not found: "${identifier}"`);
      return;
    }

    if (this.journalPageId && !this.journalPageId.includes('JournalEntry')) {
      ui.notifications?.warn(
        game.i18n?.localize(
          'enhanced-region-behavior.Regions.Journal.MigrationError'
        ) ?? 'Migration failed for journalPageId. Please reset the page ID in the Open Journal Behavior settings.'
      );
    }

    if (this.showToAll) {
      game.socket?.emit('showEntry', this.journalPageId ?? document, {
        force: true,
      });
    }
    game.socket?.emit('showEntry', this.journalPageId ?? document, {
      force: true,
      users: [event.user.id],
    });
  }
}

const soundEffectSchema = {
  soundPath: new foundry.data.fields.StringField({
    required: true,
    initial: '',
  }),
  volume: new foundry.data.fields.NumberField({
    required: false,
    initial: 0.8,
    min: 0,
    max: 1,
    step: 0.01,
  }),
};

export class SoundEffectRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<typeof soundEffectSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.SoundEffect',
  ];

  static override defineSchema() {
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.TOKEN_ANIMATE_IN,
          CONST.REGION_EVENTS.TOKEN_ANIMATE_OUT,
          CONST.REGION_EVENTS.TOKEN_ENTER,
          CONST.REGION_EVENTS.TOKEN_EXIT,
          CONST.REGION_EVENTS.TOKEN_MOVE_IN,
          CONST.REGION_EVENTS.TOKEN_MOVE_OUT,
          CONST.REGION_EVENTS.TOKEN_TURN_START,
          CONST.REGION_EVENTS.TOKEN_TURN_END,
          CONST.REGION_EVENTS.TOKEN_MOVE_WITHIN,
          'regionClicked', // Custom event for region clicks
        ],
      }),
      ...soundEffectSchema,
    };
  }

  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    // The user that initiated the movement handles event
    if (!event.user.isSelf) return;

    const soundPath = this.soundPath.trim();
    const volume = typeof this.volume === 'number' ? this.volume : 0.8;

    if (!soundPath) {
      ui.notifications?.warn('No sound path specified.');
      return;
    }

    // Use Sequencer if the module is active
    const sequencerActive = game.modules?.get('sequencer')?.active;
    if (sequencerActive && typeof Sequence !== 'undefined') {
      try {
        await new Sequence().sound().file(soundPath).volume(volume).play();
        return;
      } catch (err) {
        console.warn(
          'Sequencer failed to play sound, falling back to AudioHelper.',
          err
        );
      }
    }

    // Fallback to Foundry's AudioHelper
    game.socket?.emit('playAudio', { src: soundPath, volume, loop: false });
  }
}

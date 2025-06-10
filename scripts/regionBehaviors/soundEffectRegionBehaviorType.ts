const soundEffectSchema = () => {
  return {
    soundPath: new foundry.data.fields.StringField({
      label: game.i18n?.localize('enhanced-region-behavior.SoundEffectPathLabel'),
      required: true,
      initial: '',
    }),
    volume: new foundry.data.fields.NumberField({
      label: game.i18n?.localize('enhanced-region-behavior.SoundEffectVolumeLabel'),
      required: false,
      initial: 0.8,
      min: 0,
      max: 1,
      step: 0.01,
    }),
  };
};

type soundEffectSchema = ReturnType<typeof soundEffectSchema>;

export class SoundEffectRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<soundEffectSchema> {

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
          CONST.REGION_EVENTS.TOKEN_MOVE_WITHIN,
        ],
      }),
      ...soundEffectSchema(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _handleRegionEvent(_event: RegionDocument.RegionEvent) {
    const soundPath = this.soundPath?.trim();
    const volume = typeof this.volume === "number" ? this.volume : 0.8;

    if (!soundPath) {
      ui.notifications?.warn("No sound path specified.");
      return;
    }

    // Use Sequencer if the module is active
    const sequencerActive = game.modules?.get("sequencer")?.active;
    if (sequencerActive && typeof Sequence !== "undefined") {
      try {
        await new Sequence()
          .sound()
          .file(soundPath)
          .volume(volume)
          .play();
        return;
      } catch (err) {
        console.warn("Sequencer failed to play sound, falling back to AudioHelper.", err);
      }
    }

    // Fallback to Foundry's AudioHelper
    await foundry.audio.AudioHelper.play({ src: soundPath, volume, loop: false }, true);
  }
}
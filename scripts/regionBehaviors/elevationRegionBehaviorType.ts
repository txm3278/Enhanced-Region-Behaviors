const elevationSchema = () => {
  return {
    elevation: new foundry.data.fields.NumberField({
      required: true,
      initial: 0,
    }),
  };
};

type ElevationSchema = ReturnType<typeof elevationSchema>;

export class ElevationRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<ElevationSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.elevation',
  ];

  static override defineSchema() {
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.TOKEN_ENTER,
          CONST.REGION_EVENTS.TOKEN_EXIT,
        ],
      }),
      ...elevationSchema(),
    };
  }

  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    const token = (event.data as { token?: TokenDocument | null }).token;
    const movement = (
      event.data as {
        movement?: TokenDocument.TokenMovement | null;
      }
    ).movement;
    if (!token) return;
    // The user that initated the movement handles the TOKEN_MOVE_IN event
    if (!event.user.isSelf) return;

    // Stop movement. Important: no async operations before this!
    token.stopMovement();

    // Await movement animation
    if (token.rendered) await token.object?.movementAnimationPromise;

    // Adjust pending movement waypoints
    const adjustedWaypoints = movement.pending.waypoints
      .filter((w) => !w.intermediate)
      .map((w) => ({ ...w, elevation: this.elevation }));
    await token.move(adjustedWaypoints, {
      ...movement.updateOptions,
      constrainOptions: movement.constrainOptions,
      autoRotate: movement.autoRotate,
      showRuler: movement.showRuler,
    });
  }
}

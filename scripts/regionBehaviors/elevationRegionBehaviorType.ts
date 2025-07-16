const elevationSchema = {
  elevation: new foundry.data.fields.NumberField({
    required: true,
    initial: 0,
  }),
};

export class ElevationRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<typeof elevationSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.Elevation',
  ];

  static override defineSchema() {
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.TOKEN_ENTER,
          CONST.REGION_EVENTS.TOKEN_EXIT,
        ],
      }),
      ...elevationSchema,
    };
  }

  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    // The user that initiated the movement handles event
    if (!event.user.isSelf) return;

    const elevation = typeof this.elevation === 'number' ? this.elevation : 0;
    const token = (event.data as { token?: TokenDocument | null }).token;
    const movement = (
      event.data as {
        movement?: TokenDocument.MovementData | null;
      }
    ).movement;
    if (!token || !movement) return;

    // Stop movement. Important: no async operations before this!
    token.stopMovement();

    // Await movement animation
    if (token.rendered) await token.object?.movementAnimationPromise;

    // Adjust pending movement waypoints
    const adjustedWaypoints = movement.pending.waypoints
      .filter((w) => !w.intermediate)
      .map((w) => ({ ...w, elevation: elevation }));
    await token.move(adjustedWaypoints, {
      ...movement.updateOptions,
      constrainOptions: movement.constrainOptions,
      autoRotate: movement.autoRotate,
      showRuler: movement.showRuler,
    });
  }
}

const showVisualSchema = {
  imagePath: new foundry.data.fields.StringField({
    required: true,
    initial: '',
  }),
  duration: new foundry.data.fields.NumberField({
    required: false,
    initial: 2000,
    min: 0,
    step: 100,
  }),
  infinite: new foundry.data.fields.BooleanField({
    required: false,
    initial: false,
  }),
};

type ShowVisualSchema = typeof showVisualSchema;

export class VisualEffectRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<ShowVisualSchema> {
  static LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.ShowVisual',
  ];

  static defineSchema() {
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.TOKEN_ENTER,
          CONST.REGION_EVENTS.TOKEN_EXIT,
          CONST.REGION_EVENTS.TOKEN_MOVE_IN,
          CONST.REGION_EVENTS.TOKEN_MOVE_OUT,
          CONST.REGION_EVENTS.TOKEN_MOVE_WITHIN,
          'regionClicked',
        ],
      }),
      ...showVisualSchema,
    };
  }

  async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    const regionDoc = event.region;
    if (!regionDoc) return;

    const duration = typeof this.duration === 'number' ? this.duration : 2000;
    const imagePath = this.imagePath;
    const infinite = !!this.infinite;

    // Use Sequencer if active and file is a .webm
    const sequencerActive = game.modules?.get('sequencer')?.active;
    if (sequencerActive && regionDoc.shapes?.length > 0) {
      const shape = regionDoc.shapes[0] as
        | foundry.data.RectangleShapeData
        | foundry.data.PolygonShapeData
        | foundry.data.EllipseShapeData;
      let sequencerShape: EffectSection["shape"] | undefined;

      if (shape.type === 'polygon' && Array.isArray(shape.points)) {
        sequencerShape =
          {'polygon' as Shapes,
          {
            points: shape.points.flat(),
          }};
      } else if (shape.type === 'ellipse') {
        sequencerShape =
          {'ellipse' as Shapes,
          {
            width: shape.width,
            height: shape.height,
          }};
      } else if (shape.type === 'rectangle') {
        sequencerShape =
          {'rectangle' as Shapes,
          {
            width: shape.width,
            height: shape.height,
          }};
      }

      if (sequencerShape) {
        const seq = new Sequence()
          .effect()
          .file(imagePath)
          .shape(sequencerShape)
          .tieToDocuments([regionDoc])
          .atLocation({ x, y });
        if (!infinite && duration > 0) seq.duration(duration);
        await seq.play();
      }
    }
  }
}

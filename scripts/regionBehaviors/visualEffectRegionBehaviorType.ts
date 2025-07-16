const visualSchema = {
  imagePath: new foundry.data.fields.StringField({
    required: true,
    initial: '',
  }),
  duration: new foundry.data.fields.NumberField({
    required: false,
    initial: 0,
    min: 0,
  }),
  scale: new foundry.data.fields.NumberField({
    required: false,
    initial: 1,
    min: 0.1,
  }),
  infinite: new foundry.data.fields.BooleanField({
    required: false,
    initial: false,
  }),
  belowTokens: new foundry.data.fields.BooleanField({
    required: false,
    initial: false,
  }),
  playAtTokenLocation: new foundry.data.fields.BooleanField({
    required: false,
    initial: false,
  }),
};

export class VisualEffectRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<typeof visualSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.VisualEffect',
  ];

  static override defineSchema() {
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.BEHAVIOR_ACTIVATED,
          CONST.REGION_EVENTS.BEHAVIOR_DEACTIVATED,
          CONST.REGION_EVENTS.TOKEN_ANIMATE_IN,
          CONST.REGION_EVENTS.TOKEN_ANIMATE_OUT,
          CONST.REGION_EVENTS.TOKEN_TURN_START,
          CONST.REGION_EVENTS.TOKEN_TURN_END,
          CONST.REGION_EVENTS.TOKEN_ENTER,
          CONST.REGION_EVENTS.TOKEN_EXIT,
          CONST.REGION_EVENTS.TOKEN_MOVE_IN,
          CONST.REGION_EVENTS.TOKEN_MOVE_OUT,
          CONST.REGION_EVENTS.TOKEN_MOVE_WITHIN,
          'regionClicked',
        ],
        initial: [CONST.REGION_EVENTS.BEHAVIOR_DEACTIVATED],
      }),
      ...visualSchema,
    };
  }

  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    // The user that initiated the movement handles event
    if (!event.user.isSelf) return;

    const regionDoc = event.region;
    const behaviorId = this.parent.id ?? '0';
    const sequencerActive = game.modules?.get('sequencer').active;
    if (!sequencerActive) {
      ui.notifications?.warn(
        'The Sequencer module is required for visual effects.'
      );
      return;
    }
    const existing = Sequencer.EffectManager.getEffects({
      name: `VisualEffectRegion-${behaviorId}`,
    });

    if (existing.length > 0) {
      await Sequencer.EffectManager.endEffects({
        name: `VisualEffectRegion-${behaviorId}`,
      });
    }
    if (event.name === CONST.REGION_EVENTS.BEHAVIOR_DEACTIVATED) {
      return;
    }

    const duration = typeof this.duration === 'number' ? this.duration : 2000;
    const imagePath = this.imagePath;
    const infinite = !!this.infinite;

    if (this.playAtTokenLocation) {
      const token = (event.data as { token?: TokenDocument | null }).token;
      if (!token) {
        return;
      }
      const seq = new Sequence()
        .effect()
        .file(imagePath)
        .name(`VisualEffectRegion-${behaviorId}`)
        .atLocation(token)
        .scaleToObject(this.scale ?? 1, { considerTokenScale: true });

      if (!infinite) {
        seq.duration(duration);
      } else {
        seq.persist();
      }
      if (this.belowTokens) {
        seq.belowTokens();
      }
      await seq.play();
    } else {
      if (regionDoc.shapes.length > 0) {
        for (const shape of regionDoc.shapes) {
          if (shape.hole) continue; // Skip holes in shapes
          let sequencerShape: Shapes = 'rectangle';
          let sequencerOptions: ShapeOptions = {};
          let sequencerCenter: { x: number; y: number } = { x: 0, y: 0 };
          let sequencerSize: Size = { width: 0, height: 0 };
          if (shape.type === 'polygon' && Array.isArray(shape.points)) {
            sequencerShape = 'polygon';
            sequencerCenter = {
              x:
                shape.points.reduce((sum, val, idx) => {
                  return idx % 2 === 0 ? sum + val : sum;
                }, 0) /
                (shape.points.length / 2),
              y:
                shape.points.reduce((sum, val, idx) => {
                  return idx % 2 === 1 ? sum + val : sum;
                }, 0) /
                (shape.points.length / 2),
            };
            sequencerOptions = {
              points: Array.isArray(shape.points)
                ? shape.points.reduce(
                    (arr: [number, number][], _val, idx, src) => {
                      if (idx % 2 === 0 && src[idx + 1] !== undefined) {
                        const x = src[idx];
                        const y = src[idx + 1];
                        if (x && y) {
                          arr.push([
                            x - sequencerCenter.x,
                            y - sequencerCenter.y,
                          ]);
                        }
                      }
                      return arr;
                    },
                    []
                  )
                : [],
              isMask: true,
            };
            // Calculate width and height of the polygon
            const xs = shape.points.filter((_, i) => i % 2 === 0);
            const ys = shape.points.filter((_, i) => i % 2 === 1);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            sequencerSize = {
              width: maxX - minX,
              height: maxY - minY,
            };
          } else if (shape.type === 'ellipse') {
            sequencerShape = 'ellipse';
            sequencerOptions = {
              width: shape.radiusX,
              height: shape.radiusY,
              isMask: true,
            };
            sequencerSize = {
              width: shape.radiusX * 2,
              height: shape.radiusY * 2,
            };
            sequencerCenter = {
              x: shape.x,
              y: shape.y,
            };
          } else if (shape.type === 'rectangle') {
            sequencerShape = 'rectangle';
            sequencerOptions = {
              width: shape.width,
              height: shape.height,
              offset: {
                x: -shape.width / 2,
                y: -shape.height / 2,
              },
              isMask: true,
            };
            sequencerSize = {
              width: shape.width,
              height: shape.height,
            };
            sequencerCenter = {
              x: shape.x + shape.width / 2,
              y: shape.y + shape.height / 2,
            };
          }

          const seq = new Sequence()
            .effect()
            .file(imagePath)
            .name(`VisualEffectRegion-${behaviorId}`)
            .shape(sequencerShape, sequencerOptions)
            .tieToDocuments([regionDoc])
            .atLocation(sequencerCenter)
            .size(sequencerSize)
            .scale(this.scale ?? 1);
          if (!infinite) {
            seq.duration(duration);
          } else {
            seq.persist();
          }
          if (this.belowTokens) {
            seq.belowTokens();
          }
          await seq.play();
        }
      }
    }
  }
}

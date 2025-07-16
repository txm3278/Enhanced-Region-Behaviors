const musicSchema = {
  playlistName: new foundry.data.fields.StringField({
    required: false,
    initial: '',
  }),
  songNames: new foundry.data.fields.StringField({
    required: false,
    initial: '',
  }),
  playAll: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
  }),
  stop: new foundry.data.fields.BooleanField({
    required: true,
    initial: true,
  }),
  playPlaylist: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
  }),
};

export class MusicRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<typeof musicSchema> {
  static override LOCALIZATION_PREFIXES = [
    'enhanced-region-behavior.Regions.Music',
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
          'regionClicked', // Custom event for region clicks
        ],
      }),
      ...musicSchema,
    };
  }

  override async _handleRegionEvent(event: RegionDocument.RegionEvent) {
    if (!event.user.isSelf) return;

    // Ensure the gm handles the event
    await game.users?.activeGM?.query(
      'enhanced-region-behavior.handleMusicRegion',
      {
        playlistName: this.playlistName.trim(),
        songNames: this.songNames
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        playAll: !!this.playAll,
        stop: !!this.stop,
        playPlaylist: !!this.playPlaylist,
      }
    );
  }
}

export const handleMusicRegion = async ({
  playlistName,
  songNames,
  playAll,
  stop,
  playPlaylist,
}: {
  playlistName: string;
  songNames: string[];
  playAll: boolean;
  stop: boolean;
  playPlaylist: boolean;
}) => {
  let playlist;
  if (playlistName) {
    playlist = game.playlists?.getName(playlistName);
  }

  // If no playlist specified, search all playlists for the songs
  const playlistsToSearch = playlist ? [playlist] : game.playlists?.contents;

  // Find requested songs
  const foundSongs: PlaylistSound[] = [];
  for (const name of songNames) {
    for (const pl of playlistsToSearch ?? []) {
      const song = pl.sounds.getName(name);
      if (song) foundSongs.push(song);
    }
  }

  // Stop all currently playing music if stop is enabled
  if (stop) {
    for (const pl of game.playlists?.playing ?? []) {
      await pl.stopAll();
    }
  }

  // Play entire playlist if requested and playlist is found
  if (playPlaylist && playlist) {
    await playlist.playAll();
    return;
  }

  if (foundSongs.length === 0) {
    console.warn(`No matching songs found for: ${songNames.join(', ')}`);
    return;
  }

  // Play songs
  if (playAll) {
    for (const song of foundSongs) {
      await song.update({ playing: true, pausedTime: 0 });
    }
  } else {
    // Play only the first song
    if (foundSongs[0]) {
      await foundSongs[0].update({ playing: true, pausedTime: 0 });
    }
  }
};

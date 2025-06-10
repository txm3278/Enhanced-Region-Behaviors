const musicSchema = () => {
  return {
    playlistName: new foundry.data.fields.StringField({
        label: game.i18n?.localize('enhanced-region-behavior.MusicPlaylistLabel'),
        required: false,
        initial: '',
      }),
      songNames: new foundry.data.fields.StringField({
        label: game.i18n?.localize('enhanced-region-behavior.MusicSongNamesLabel'),
        required: false,
        initial: '',
      }),
      playAll: new foundry.data.fields.BooleanField({
        label: game.i18n?.localize('enhanced-region-behavior.MusicPlayAllLabel'),
        required: true,
        initial: false,
      }),
      stop: new foundry.data.fields.BooleanField({
        label: game.i18n?.localize('enhanced-region-behavior.MusicStopLabel'),
        required: true,
        initial: true,
      }),
      playPlaylist: new foundry.data.fields.BooleanField({
        label: game.i18n?.localize('enhanced-region-behavior.MusicPlayPlaylistLabel'),
        required: true,
        initial: false,
      }),
  };
};

type musicSchema = ReturnType<typeof musicSchema>;

export class MusicRegionBehaviorType extends foundry.data.regionBehaviors
  .RegionBehaviorType<musicSchema> {

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
            CONST.REGION_EVENTS.TOKEN_ROUND_START,
            CONST.REGION_EVENTS.TOKEN_ROUND_END,
          ],
        }),
        ...musicSchema(),
      };
    }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _handleRegionEvent(_event: RegionDocument.RegionEvent) {
    const playlistName = this.playlistName?.trim();
    const songNames = this.songNames?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
    const playAll = !!this.playAll;
    const stop = !!this.stop;
    const playPlaylist = !!this.playPlaylist;

    let playlist: Playlist | undefined;
    if (playlistName) {
      playlist = game.playlists?.getName(playlistName) as Playlist | undefined;
    }

    // If no playlist specified, search all playlists for the songs
    const playlistsToSearch = playlist ? [playlist] : (game.playlists?.contents ?? []);

    // Find requested songs
    const foundSongs: PlaylistSound[] = [];
    for (const name of songNames) {
      for (const pl of playlistsToSearch) {
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
      await foundSongs[0].update({ playing: true, pausedTime: 0 });
    }
  }
}
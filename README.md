# Enhanced Region Behavior

Enhanced Region Behavior is a Foundry VTT module that adds powerful new automation options to Scene Regions. With this module, you can trigger traps, play music, or play sound effects automatically when tokens interact with regions on your maps.

## Features

- **Trap Regions**: Automatically roll saving throws or skill checks and apply damage to tokens that enter, exit, or move within a region. Supports D&D 5e abilities, skills, and damage types, with optional MidiQOL integration for advanced automation.
- **Music Regions**: Play specific songs or playlists, or stop all music, when tokens interact with a region. Supports playing all songs or just the first match.
- **Sound Effect Regions**: Play a sound effect or sequencer effect when a region is triggered. Supports volume control and integration with the Sequencer module if available.
- **Visual Effect Regions**: Automatically play an image or animation effect when tokens interact with a region. Supports static images and animated files, with options for duration, scale, display layer. Requires Sequencer
- **Elevation Regions**: Automatically set the elevation of tokens when they enter or exit a region.
- **Open Journal Regions**: Automatically open journal or journal page when tokens interact with a region.
- **Trigger Action Regions**: Automatically trigger items from character sheets when tokens interact with a region. Supports MidiQOL for advanced automation.

## Requirements

- Foundry VTT v13+
- D&D 5e system (minimum 5.0.3) (optional, required for Trap Region)
- [libWrapper](https://foundryvtt.com/packages/lib-wrapper) (optional but highly recommended)
- [MidiQOL](https://foundryvtt.com/packages/midi-qol) (optional, for advanced trap automation)
- [Sequencer](https://foundryvtt.com/packages/sequencer) (optional, for advanced sound effects)

## Installation

You can install Enhanced Region Behavior using either of the following methods:

### Option 1: Foundry's Module Installer (Recommended)

1. In Foundry VTT, go to **Add-on Modules** > **Install Module**.
2. Search for "Enhanced Region Behavior" in the module browser.
3. Click **Install** to add the module to your Foundry installation.
4. Enable the module in your world from the **Manage Modules** menu.

### Option 2: Install via Manifest URL

1. In Foundry VTT, go to **Add-on Modules** > **Install Module**.
2. Paste the manifest URL from the [GitHub Releases page](https://github.com/txm3278/Enhanced-Region-Behaviors/releases) into the installer.
3. Click **Install** to add the module to your Foundry installation.
4. Enable the module in your world from the **Manage Modules** menu.

## Usage

### Trap Regions (5e)

1. Create or edit a Scene Region.
2. Set the Region Behavior type to **Trap**.
3. Configure the trap:
   - **Automate Damage**: Automatically apply damage
   - **DC**: The DC for the saving throw or skill check.
   - **Save Ability**: The ability scores for saving throws (e.g., DEX, CON). You can select multiple abilities and choose which one to use when triggered. Take priority over Skill Checks
   - **Skill Checks**: The skills for skill checks (e.g., Stealth, Perception). You can select multiple skills and choose which one to use when triggered.
   - **Damage**: Damage formula if the save/check fails (e.g., `2d6`).
   - **Damage if Saved**: Damage formula if the save/check succeeds (e.g., `1d6`).
   - **Damage Type**: The type of damage (e.g., piercing, fire).
   - **Save Failed/Success Message**: Custom chat messages.
   - **Trigger Behavior on Save**: (Optional) Another region behavior to trigger when the saving throw succeeds.
   - **Trigger Behavior on Fail**: (Optional) Another region behavior to trigger when the saving throw fails.

When a token triggers the region, the module will roll the saving throw or skill check and apply damage. If multiple abilities or skills are configured, a dialog will appear allowing the player to choose which one to use.

**MidiQOL Integration:**
If the [MidiQOL](https://foundryvtt.com/packages/midi-qol) module is installed and enabled, Enhanced Region Behavior will use MidiQOL's workflow to handle saving throws and damage rolls for trap regions. This allows for advanced automation, including applying effects, rolling chat cards, and integrating with other automation modules. If MidiQOL is not present, the module will use Foundry's built-in mechanics for saves and damage.

### Music Regions

1. Create or edit a Scene Region.
2. Set the Region Behavior type to **Music**.
3. Configure the music options:
   - **Playlist Name**: (Optional) Name of the playlist to use.
   - **Song Names**: Comma-separated list of song names to play.
   - **Play All Songs**: If enabled, all matching songs will play.
   - **Stop All Current Music**: If enabled, stops all currently playing music.
   - **Play Full Playlist**: If enabled, plays the entire playlist.

### Sound Effect Regions

1. Create or edit a Scene Region.
2. Set the Region Behavior type to **Sound Effect**.
3. Configure the sound effect:
   - **Path to sound file or sequencer effect**: The file path or sequencer effect to play.
   - **Volume**: Volume level (0.0 to 1.0).

If the Sequencer module is active, it will be used for playback; otherwise, Foundry's built-in audio will be used.

### Visual Effect Regions (Requires Sequencer)

1. Create or edit a Scene Region.
2. Set the Region Behavior type to **Visual Effect**.
3. Configure the visual effect:
   - **Image or Animation Path**: The file path to an image or animation (e.g., `.webm` or `.png`).
   - **Duration**: How long the effect should display (in milliseconds). Set to `0` to play the full effect.
   - **Infinite**: If enabled, the effect will persist until the region is deleted or deactivated.
   - **Scale**: (Optional) Scale the effect.
   - **Below Tokens**: (Optional) Display the effect below tokens.
   - **Play At Token Location**: (Optional) Play the effect at the triggering token's location instead of the region's shape.

### Elevation Regions

1. Create or edit a Scene Region.
2. Set the Region Behavior type to **Elevation**.
3. Configure the elevation options:
   - **Elevation**: The elevation value to set for any token that triggers the region (e.g., `10`).

### Open Journal Regions

1. Create or edit a Scene Region.
2. Set the Region Behavior type to **Open Journal**.
3. Configure the journal options:
   - **Journal ID**: (Optional) The unique ID of the specific journal to open. Takes priority over Journal Name.
   - **Journal Name**: (Optional) The name of the journal to open. Used if Journal ID is not provided.
   - **Journal Page ID**: (Optional) The specific page ID to show within the journal. Takes priority over Journal Name and Journal ID.
   - **Show to All Players**: If enabled, the journal will be shown to all players. Otherwise, only to the triggering player or token owner.

The region will automatically open the specified journal when triggered. You can use either the Journal ID (for precision) or Journal Name (for convenience). If you specify a Journal Page ID, it will show that specific page directly.

### Trigger Action Regions (5e)

1. Create or edit a Scene Region.
2. Set the Region Behavior type to **Trigger Action**.
3. Configure the action options:
   - **Item ID**: The unique ID of the item to trigger. You can drag an item from a character sheet to populate this field automatically.

When a token triggers the region, the module will use the specified item. The item will target the triggering token automatically.

**MidiQOL Integration:**
If the [MidiQOL](https://foundryvtt.com/packages/midi-qol) module is installed and enabled, Enhanced Region Behavior will use MidiQOL's advanced workflow for item usage, including automated targeting, damage application, and effect handling. If MidiQOL is not present, the module will use Foundry's built-in item mechanics.

### Region Clicked Event

A new custom event, **regionClicked**, is available for all region behaviors.
This event is triggered when a user clicks inside a region on the canvas.
You can use this event to trigger certain region behavior (Sound Effect, Visual Effect) in response to a click.

---

## Localization

Currently, only English is provided. You can add additional languages by creating new files in the `languages/` folder.

## Development

- Clone the repository.
- Run `npm install` to install dependencies.
- Use `npm run dev` for development or `npm run build` to build the module.
- The main entry point is [`scripts/module.ts`](scripts/module.ts).

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

Created by [TMinz](https://github.com/txm3278).

---

For bug reports or feature requests, please use the [GitHub Issues page](https://github.com/txm3278/Enhanced-Region-Behaviors/issues).

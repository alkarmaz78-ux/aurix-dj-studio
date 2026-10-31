# AURIX DJ STUDIO

Windows desktop DJ workspace built with Electron, React, TypeScript and Vite.

## Current prototype

- Two independent audio decks with local audio playback
- Import multiple local audio files (MP3, WAV, FLAC, M4A, OGG, AAC)
- Play, pause, seek and return-to-start Cue
- Per-deck tempo and volume controls
- Crossfader and master-level controls (UI prototype)
- Session-only track list and quick load to Deck A or B
- Windows NSIS installer build through GitHub Actions

## Development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run desktop:dev
```

## Build Windows installer locally

```bash
npm install
npm run dist:win
```

The installer is written to `release/`.

## Build using GitHub Actions

Every push to `main` builds a Windows installer and uploads it as a workflow artifact.
To publish a downloadable GitHub Release, create and push a version tag, for example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Open the repository's **Actions** tab to inspect the build. Tagged builds publish the installer in **Releases**.

## Important prototype limitations

This is an early desktop prototype, not yet a professional low-latency DJ system. The current crossfader and master controls are interface controls and are not yet connected to a shared multi-deck audio mixer. EQ controls are visual placeholders. BPM/key detection, beatgrid, sync, hot cues, looping, MIDI mapping, headphone cue routing, persistent library and real AI STEMS separation are not implemented yet. Professional low-latency output and reliable controller integration will require a dedicated native audio engine (for example, Rust with WASAPI/ASIO).

No music is uploaded to a cloud service; selected tracks are opened locally on the computer.
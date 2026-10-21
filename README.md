# CLEAN ORBIT · くるっと！おそうじ惑星

An independent, original mobile browser game by KAZU PLAY. The existing games and YouTube Playables versions are not modified by this project.

## First expedition — VERDIA

One polished planet, three neighborhoods: Meadow, Grove, Sunset. Turn the planet with a horizontal swipe or the arrow buttons. MOPI automatically collects nearby cans, bottles and paper. Dodge rocks; collect magnets and repairs; charge a four-and-a-half-second super vacuum. Complete 900 m and collect 60 pieces. Return with two shields and reach a combo of 15 to earn all three stars.

The level has 135 recyclable pieces. Its collection paths are authored, deterministic and repeatable for learning. The five routes always contain a safe path. A round lasts about 90 seconds. This first version contains one planet, not an endless or multi-planet campaign.

Original spherical Canvas graphics, animated robot, particles and synthesized musical score. No external assets, tracking, ad SDK, runtime downloads, dependencies or network requests beyond the static game files. Best score, collected totals, three robot color choices and sound/language preferences are stored in this browser only. Browser data deletion removes records. Offline/install support and the YouTube Playables SDK are not included in this release.

## Controls

- iPhone / Android: swipe anywhere on the planet, or use the large left/right arrows. Tap SUPER VACUUM when charged.
- Desktop: Left/Right arrows or A/D; Space for vacuum; P/Escape to pause.
- Japanese and English are available. `?lang=ja` or `?lang=en` selects the initial language.
- Sound starts after a user gesture. Music and effects can be independently disabled. Gentle effects are available in settings.
- Hiding the tab pauses the expedition. Resume manually.

## Phone acceptance checks

1. Open the HTTPS test link in Safari on iPhone and Chrome on Android. Use portrait orientation.
2. Start the game; verify the whole HUD and bottom controls are visible without scrolling.
3. Swipe both ways, then test the arrow buttons. Check collected pieces and score increase.
4. Dodge rocks; verify shield loss, temporary protection and the retry screen.
5. Collect 20 pieces to charge the vacuum, then activate it; test magnet and repair pickups.
6. Pause/resume, switch apps and return. Movement must remain paused until resumed.
7. Check BGM/effects after starting, after app switching and after toggling sound. Check headphones and device volume.
8. Complete the planet; verify result stars, retry, best score and unlocked colors persist after reload.
9. Test a small phone and landscape. The dialog can scroll; the main game should not.

Real-device iPhone audio and touch behavior should be confirmed by the owner; desktop browser viewport QA is not a substitute for this check.

## Files

`engine.js`: deterministic level generation, collision, collection, scoring and progression.
`renderer.js`: spherical projection, terrain, props, MOPI and effects.
`audio.js`: original synthesized music/effects, gesture-based AudioContext resume.
`app.js`: interface, controls, localization, pause and local records.

The local project also includes engine tests and a static preview server. No build is required for deployment. All paths are relative, so GitHub Pages project URLs are supported.

## Rights

Original game code, character and procedural music. All rights reserved. No third-party recordings or character assets are used.

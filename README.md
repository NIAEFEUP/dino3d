# How to run

Install dependencies
```bash
npm install
```

Watch for changes
```bash
npx gulp
```

Run server
```bash
npx http-server -c-1 -p 8010
```

# Recommended tools

- [VOX Viewer for VSCode](https://marketplace.visualstudio.com/items?itemName=Tovi.vscode-vox) - VSCode extension for previewing MagicaVoxel models (.vox files)
- [MagicaVoxel](https://ephtracy.github.io/) - Free lightweight 8-bit voxel art editor

# Description
T-Rex Run 3D is a ThreeJS WebGL game made as an experiment.  
All the graphics was hand crafted with Magica Voxel software, so that the overall feel and look of the game will be the same as original 2D game.

*The code has NOT been polished and is provided "as is". There are a lot of code that are redundant and there are tons of improvements that can be made.*

# Screenshot
![T-Rex Run 3D](https://i.imgur.com/fESLYlF.png)

# ToDo
https://trello.com/b/Pt4FSqOi/t-rex-run-3d

## Change history
- Update 1
  - New interface
  - Infinity jumping while holding jump button
  - Jumping buttons now is: Space, Arrow Up, W
  - Bend down buttons now is: Arrow Down, S, Ctrl
  - Restart on game end
  - Fixed bug when a player could switch active tab and collisions ingame was not working
  - Fixed bug with not fully loaded textures before game start
  - Fixed bug when high scores continued to count even after game end
  - Fixed hitbox
  - Fixed ability to jump from bend down position
  - Fixed disappearing ground textures
  - Other minor bug fixes

- Update 2
  - Voxel landscape added
  - Palm trees has been removed, instead there is scorpions, skulls, etc
  - UI is now fully in pixel art style
  - Load screen added
  - New dino reaction on collisions
  - W & S keys was removed
  - Nature Manager & Enemy Manager was fully rewritten for better performance and new feautures
  - "Black screens" bug fixed
  - High jumps bug fixed
  - Scores display fixed
  - Moving objects stuttering fixed (never use .splice() again :3)

## Credits
https://threejs.org/ - WebGL 3D Library  
https://ephtracy.github.io/ - Free lightweight 8-bit voxel art editor  
https://github.com/daishihmr/vox.js/ - MagicaVoxel *.vox file parser and Three.js mesh builder  
https://github.com/goldfire/howler.js/ - Audio library  
https://github.com/creativelifeform/three-nebula - WebGL based particle system engine for three.js  
https://github.com/addyosmani/visibly.js/ - Page Visibility API shim

## Author

(C) 2020 Abraham Tugalov.
http://howdyho.net

## Contributors
- Aidar Ayupov <https://github.com/preposition17> & Vildan Safin <https://github.com/Enigma228322> for inspiration about 3D models
- Rifat Fazlutdinov <https://github.com/Rifat-Fazlutdinov> for telegram bugreport bot
- Arnur Bekbolov <https://vk.com/kurasaiiiii> for skins ideas


## Pose Detection Model

0: nose  \
1: left_eye  \
2: right_eye  \
3: left_ear  \
4: right_ear  \
5: left_shoulder  \
6: right_shoulder  \
7: left_elbow  \
8: right_elbow  \
9: left_wrist  \
10: right_wrist  \
11: left_hip  \
12: right_hip  \
13: left_knee  \
14: right_knee  \
15: left_ankle  \
16: right_ankle
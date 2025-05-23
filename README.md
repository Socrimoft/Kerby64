# Kerby64

![GitHub package.json version](https://img.shields.io/github/package-json/v/socrimoft/Kerby64?label=Version&color=green)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub package.json dev/peer/optional dependency version](https://img.shields.io/github/package-json/dependency-version/socrimoft/Kerby64/dev/%40babylonjs%2Fcore?label=Babylon.js&color=orange)](https://doc.babylonjs.com/whats-new/)

**Kerby64** is a compilation of mini-games built with
[Babylon.js](https://babylonjs.com/). It features procedural terrain generation,
custom-made shader material and compute shaders, and dynamic rendering
techniques.

A GitHub action is configured to deploy the latest version of the game online.
You can access it at [https://kerby54.pages.dev/](https://kerby54.pages.dev/)

**IMPORTANT**: A [WebGPU-compatible browser](https://caniuse.com/webgpu) is
needed to run the game (e.g., Chrome, Edge)

## Table of Contents

1. [Games list](#games-list)
2. [The team](#the-team)
3. [Project structure](#project-structure)
4. [How to run locally](#how-to-run-locally)
5. [Acknowledgments](#acknowledgments)

## Games list

- **Rush**: Never-ending, random-generated platformer with mario world look.
- **Bird**: Flappy Bird with Mario theme.
- **World**: Attempt at creating Minecraft on a web game engine with the help of
  compute shader to leverage GPU for chunk generation.
- **Classic**: Kirby's dream land remake.

## The team

- **Dorian REYNIER**, aka [Fenris1801](https://github.com/Fenris1801): Bird,
  Classic
- **Loïc ANDRÉ**, aka [Loic-An](https://github.com/Loic-An): World
- **Ludovic CLOLOT**, aka [Ludoclt](https://github.com/Ludoclt): Rush

## Project structure

```
Kerby64/
├── src/
│   ├── compute_shaders/    # Compute shader WGSL files
│   ├── voxel/              # Voxel-related logic (e.g., chunks, blocks)
│   ├── world/              # World generation and management
│   └── game.ts             # Entry point of the application
├── public/                 # Static assets (e.g., textures, models)
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation (you are here)
└── tsconfig.json           # TypeScript configuration
```

## How to run locally

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

Next, follow thoses procedures:

1. Clone the repository:
   ```bash
   git clone https://github.com/Socrimoft/Kerby64.git
   cd Kerby64
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Acknowledgments

- [Babylon.js](https://www.babylonjs.com/) for the rendering engine.
- [Lunehiver](https://open.spotify.com/intl-fr/artist/5wHJFgKLG9GDdUWH4Xu8Ka)
  for the original soundtrack.

Note: While making the game, some contents that are not under an open source
license were used as placeholder. It is possible that some of them still
remains: feel free to report such content to us to remove them.

---

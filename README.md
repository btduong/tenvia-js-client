# Tenvia client
This is the frontend client for Tenvia written in TypeScript +  React.

## Architecture

- **Framework:** Vite + React with TypeScript 
- **Styling** Each component uses `module.css` to avoid global name clashing
- **Testing** Vitest for unit testing

## Overview
1. **Custom hooks**
State logic are encapsulated in custom hooks where appropriate. Such as:
- `useKeyboardShortcut` hook that listening for key presses
- `useTickingSound` to play looping sound effect

2. **API Service**
All HTTP communication with the server is abstracted in `serviceApi.ts`. 

3. **React Router and Components**
The application is separated into different routes (`pages`) for handling navigation between different components like a game session summary or a question with multiple-choice answers.

## Main Features
- **Gameplay:** a countdown timer with a looping audio effect
- **Power-up Items:** an in-game item that allows players to activate lifelines such as 50-50
- **Keyboard shortcuts:** for submitting answer without constantly clicking
- **Leaderboard:** displays a global top 25 high scores from `leaderboard-service`

## Quickstart

### Required:
- Node.js (v18+)
- npm or yarn

### Installation

```
# Install dependencies
npm install
```

To start the dev server
```
npm run dev
```
This makes the application available at `http://localhost:5173`

To run all the tests and generate an HTML report
```
npm run test
```
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ed4c992e-cbcb-4a72-bb1d-f6d6a28da887

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Image Assets Rule

- All image URLs are centralized in [src/config/assets.ts](src/config/assets.ts).
- Business code should only reference image keys (for example: `leader_wang_zhaokai`, `faction_orthodox`, `ending_game_over_pan`).
- Do not write real image URLs directly inside components, events, or game state mutations.
- Use helper functions from [src/config/assets.ts](src/config/assets.ts):
   - `getLeaderPortraitUrl`
   - `getAdvisorPortraitUrl`
   - `getFactionPortraitUrl`
   - `getEndingImageUrl`
   - `getSuperEventImageUrl`

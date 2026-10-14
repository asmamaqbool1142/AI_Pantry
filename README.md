# PantryPilot AI

PantryPilot AI is a mobile-first household cooking and grocery planner for Pakistani homes. It focuses on meal suggestions, kitchen inventory, grocery planning, and budget awareness without requiring API keys in demo mode.

## Features

- Guided household onboarding
- Daily meal suggestions with three core dishes
- Inventory tracking with manual entry and upload simulation
- Grocery list planning with simple budget calculations
- Demo pricing and clear simulation labels
- Local browser persistence for a working prototype
- AI pantry assistant card with optional Hugging Face model support
- Budget-aware and guest-aware meal recommendations

## Run locally

1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Open http://localhost:3000

## Demo mode

The app starts with realistic sample data for a Lahore household. AI, pricing, and OCR are clearly labeled as demo or simulated so the app remains usable without credentials.

## Optional AI integration

If you want to connect a real free model from Hugging Face, add a .env.local file with your token and model:

```bash
HUGGINGFACE_API_TOKEN=your_token_here
HUGGINGFACE_MODEL=google/flan-t5-small
```

If the token is missing, the app keeps working in demo mode and clearly labels the AI result as simulated.

## Environment

Create a .env.local file from .env.example when you want to add environment flags later.

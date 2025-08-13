# Create project with patch

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ovh6581-4224s-projects/v0-create-project-with-patch)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/bmxOwp03qUR)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/ovh6581-4224s-projects/v0-create-project-with-patch](https://vercel.com/ovh6581-4224s-projects/v0-create-project-with-patch)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/bmxOwp03qUR](https://v0.app/chat/projects/bmxOwp03qUR)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Seguimiento API

This project now exposes two endpoints to assist with study planning:

- `POST /api/next`: receives `{ slotMinutes, currentTrackSlug?, forceSwitch? }` and
  returns the next recommended track to study. Responds with `204` when there are
  no pending tracks.
- `POST /api/progress`: receives `{ trackSlug, minutesSpent?, nextIndex? }` to
  register completed work on a track and returns the updated track along with the
  next suggestion.

Each suggestion includes the planned acts and minutes together with a reason and
diagnostic values (`Δ, D, R, cuota, score`) that follow the scheduling rules.
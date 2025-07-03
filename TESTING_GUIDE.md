# AI Fantasy Draft Assistant - Testing Guide

## Setup Instructions

### 1. Backend Setup

1. **Copy the environment file:**
```bash
cd backend
cp .env.example .env
```

2. **Update `.env` with your credentials:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_KEY`: Your Supabase service key
- `CLAUDE_API_KEY`: Your Claude API key

3. **Run Supabase schema:**
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy contents of `/supabase/schema.sql`
- Run the SQL to create tables

4. **Install dependencies:**
```bash
npm install
```

### 2. Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **No additional configuration needed** - frontend uses default localhost URLs

### 3. Start the Application

From the root directory:
```bash
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:5173

## Testing Checklist

### Phase 1: Authentication & Connection
- [ ] Open http://localhost:5173
- [ ] Enter a valid Sleeper username
- [ ] Verify successful connection
- [ ] Check user data is stored in Supabase

### Phase 2: Draft Selection
- [ ] View list of active drafts (if any)
- [ ] If no active drafts:
  - Create a mock draft on Sleeper
  - Refresh the drafts page
- [ ] Click on a draft to enter draft room

### Phase 3: Draft Room Interface
- [ ] **Player Pool (Left Panel)**
  - [ ] Search for players by name
  - [ ] Filter by position (QB, RB, WR, etc.)
  - [ ] Sort by rank/name/position
  - [ ] Verify drafted players are hidden

- [ ] **Analysis Panel (Center)**
  - [ ] Select a player from pool
  - [ ] Click "Get AI Analysis"
  - [ ] Verify AI recommendations appear
  - [ ] Switch between Overview and Agent tabs
  - [ ] Check all 4 agent analyses

- [ ] **My Team (Right Panel - Top)**
  - [ ] View drafted players by position
  - [ ] Check roster needs calculation
  - [ ] Verify pick numbers are correct

- [ ] **Recent Picks (Right Panel - Bottom)**
  - [ ] View last 10 picks
  - [ ] Verify pick order is correct

### Phase 4: Real-time Sync
- [ ] Make a pick in Sleeper
- [ ] Verify it appears in draft room within 2-3 seconds
- [ ] Check "Recent Picks" updates
- [ ] Verify player is removed from available pool

### Phase 5: AI Analysis Testing
- [ ] Test different player types:
  - [ ] High-value player (top 20)
  - [ ] Mid-round player
  - [ ] Late-round player
  - [ ] Position of need
  - [ ] Position already filled

- [ ] Verify AI considers:
  - [ ] Draft value (ADP differential)
  - [ ] Team composition needs
  - [ ] Position scarcity
  - [ ] Player risk factors

### Phase 6: Edge Cases
- [ ] Test with slow internet connection
- [ ] Test with invalid Sleeper username
- [ ] Test with completed draft
- [ ] Test with paused draft
- [ ] Test logout and re-login

## Common Issues & Solutions

### Backend won't start
- Check all environment variables are set
- Verify Supabase credentials are correct
- Check port 3001 is not in use

### Can't connect to Sleeper
- Verify username is exact (case-sensitive)
- Check Sleeper API is accessible
- Try with a different username

### AI Analysis fails
- Verify Claude API key is valid
- Check you have API credits
- Look for errors in backend console

### Real-time sync not working
- Check WebSocket connection in browser console
- Verify draft is active on Sleeper
- Check network tab for socket.io connection

## Debug Mode

To see detailed logs:

1. **Backend:** Check terminal output
2. **Frontend:** Open browser console (F12)
3. **Network:** Check Network tab for API calls
4. **WebSocket:** Look for socket.io frames

## Performance Metrics

Expected performance:
- Initial load: < 2 seconds
- AI analysis: < 3 seconds
- Draft sync: < 2 seconds
- Player search: Instant

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Console errors (if any)
3. Network requests that failed
4. Steps to reproduce
5. Screenshots if UI-related
# Quick Start Guide - Referee Assignment Feature

## Setup & Run

### 1. Start Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```
Backend will run on `http://localhost:5000`

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:3000`

## Test the Feature

### Step 1: Create Test Data (if needed)

#### Create a Referee
```bash
# Using curl or Postman
POST http://localhost:5000/api/referees
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Referee",
  "email": "referee@test.com",
  "licenseNumber": "REF001",
  "certification": "FIFA Level 1",
  "experience": 5
}
```

#### Create a Match
```bash
POST http://localhost:5000/api/matches
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "competitionId": "<competition_id>",
  "homeTeamId": "<team_id>",
  "awayTeamId": "<team_id>",
  "venue": "Stadium A",
  "scheduledDate": "2024-03-15T15:00:00Z"
}
```

### Step 2: Login as Secretariat
1. Go to `http://localhost:3000/login`
2. Login with secretariat credentials
3. You'll be redirected to `/secretariat`

### Step 3: Assign Referee to Match
1. On the secretariat dashboard, find the "Assign Referee to Match" card
2. Click the "Select Match" dropdown
   - You'll see all matches with format: "Team A vs Team B - Date"
3. Click the "Select Referee" dropdown
   - You'll see all referees with format: "Name - Certification"
4. Click "Assign Referee" button
5. You should see a success message

### Step 4: View Submitted Reports
1. On the same dashboard, find the "Submitted Reports" card
2. All reports with status "SUBMITTED" will be displayed
3. Each report shows:
   - Match details (home vs away team)
   - Referee name
   - Incident type
   - Action taken (Yellow Card, Red Card, etc.)
   - Player involved (if applicable)
   - Minute of incident
   - Full description
   - Current status

## Troubleshooting

### Issue: Dropdowns are empty
**Solution:** 
- Ensure you have created at least one referee and one match
- Check browser console for API errors
- Verify backend is running and accessible

### Issue: "Assign Referee" button is disabled
**Solution:**
- Make sure both a match and referee are selected
- The button only enables when both selections are made

### Issue: Reports not showing
**Solution:**
- Ensure referees have submitted reports with status "SUBMITTED"
- Check the API endpoint: `GET /api/referees/reports?status=SUBMITTED`
- Verify authentication token is valid

### Issue: 401 Unauthorized error
**Solution:**
- Login again to get a fresh token
- Check that your user has SECRETARIAT or ADMIN role

### Issue: 404 Not Found on API calls
**Solution:**
- Verify backend is running on port 5000
- Check that match routes are properly mounted in `backend/src/index.js`
- Restart the backend server

## API Testing with curl

### Get all referees
```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/referees
```

### Get all matches
```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/matches
```

### Assign referee to match
```bash
curl -X POST http://localhost:5000/api/matches/assign-referee \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "<match_id>",
    "refereeId": "<referee_id>",
    "role": "MAIN_REFEREE"
  }'
```

### Get submitted reports
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/referees/reports?status=SUBMITTED"
```

## Default Test Credentials

If you have seeded data:
- **Admin:** admin@bifa.com / admin123
- **Secretariat:** secretariat@bifa.com / secretariat123
- **Referee:** referee@bifa.com / referee123

## Feature Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Database migrations applied
- [ ] At least one referee created
- [ ] At least one match created
- [ ] Can login as secretariat
- [ ] Can see secretariat dashboard
- [ ] Match dropdown shows matches
- [ ] Referee dropdown shows referees
- [ ] Can assign referee to match
- [ ] Assignment success message appears
- [ ] Submitted reports section shows reports (if any exist)

## Next Steps

After testing the basic functionality:
1. Test with multiple referees and matches
2. Verify that assigned referees appear in match details
3. Create disciplinary reports as a referee
4. Verify reports appear on secretariat dashboard
5. Test error handling (invalid IDs, network errors, etc.)

# Referee Report & Test Data Setup

## Changes Made

### 1. ✅ Referee Report Functionality
- **Updated**: `backend/src/controllers/matchReportController.js`
  - Changed from `matchReport` to `disciplinaryReport` model
  - Fixed to use correct Prisma schema
  - Reports now use: `incidentType`, `description`, `playersInvolved`, `severity`, `status`
  
- **Updated**: `backend/src/routes/matchReportRoutes.js`
  - Converted from ES6 to CommonJS
  - Fixed auth middleware usage
  - Routes accessible by REFEREE, ADMIN, and SECRETARIAT

- **Registered**: Routes in `backend/src/index.js`
  - Added `/api/reports` endpoint
  - Referees can create reports
  - Secretariat can view all reports

### 2. ✅ Test Data Seeding
- **Created**: `backend/seed-competitions.js`
  - Seeds 4 teams (FC Bujumbura, Vital'O FC, Le Messager Ngozi, Aigle Noir)
  - Seeds 2 competitions (BRICS Premier League 2024, BRICS Cup 2024)
  - Seeds 4 matches across both competitions

- **Created**: `seed-data.bat`
  - Quick script to run the seeding

### 3. ✅ Multi-Language Support
- Added translations for all BRICS+ countries:
  - 🇧🇷 Portuguese (Brazil)
  - 🇷🇺 Russian (Russia)
  - 🇮🇳 Hindi (India)
  - 🇨🇳 Chinese (China)
  - 🇸🇦 Arabic (Saudi Arabia, UAE, Egypt)
  - 🇪🇹 Amharic (Ethiopia)
  - 🇮🇷 Persian (Iran)
  - 🇮🇩 Indonesian (Indonesia)

## How to Use

### Seed Test Data (Easy Method)
1. **Make sure your backend is running**: `cd backend && npm run dev`
2. **Open** `seed-data.html` in your browser
3. **Click** "Seed Test Data" button
4. **Done!** Your database now has test competitions, teams, and matches

### Alternative: Using API directly
```bash
# Using curl
curl -X POST http://localhost:5000/api/seed/seed-test-data

# Using PowerShell
Invoke-RestMethod -Method POST -Uri http://localhost:5000/api/seed/seed-test-data
```

### Referee Report Flow

#### 1. Referee Creates Report
**Endpoint**: `POST /api/reports`
**Auth**: Referee or Admin
**Body**:
```json
{
  "matchId": "match-uuid",
  "incidentType": "FOUL",
  "description": "Player committed a serious foul",
  "playersInvolved": ["player1-id", "player2-id"],
  "severity": "HIGH"
}
```

#### 2. Secretariat Views Reports
**Endpoint**: `GET /api/reports`
**Auth**: Secretariat or Admin
**Query Params**:
- `status`: PENDING, REVIEWED, RESOLVED
- `refereeId`: Filter by specific referee

**Response**:
```json
[
  {
    "id": "report-uuid",
    "matchId": "match-uuid",
    "incidentType": "FOUL",
    "description": "...",
    "severity": "HIGH",
    "status": "PENDING",
    "match": {
      "homeTeam": { "name": "FC Bujumbura" },
      "awayTeam": { "name": "Vital'O FC" },
      "competition": { "name": "BRICS Premier League 2024" }
    },
    "referee": {
      "user": {
        "firstName": "John",
        "lastName": "Referee"
      }
    },
    "createdAt": "2024-02-10T10:00:00Z"
  }
]
```

#### 3. Secretariat Updates Report Status
**Endpoint**: `PUT /api/reports/:id`
**Auth**: Secretariat or Admin
**Body**:
```json
{
  "status": "REVIEWED"
}
```

## Test Data Created

### Teams
1. FC Bujumbura - Prince Louis Rwagasore Stadium
2. Vital'O FC - Intwari Stadium
3. Le Messager Ngozi - Ngozi Stadium
4. Aigle Noir - Makamba Stadium

### Competitions
1. BRICS Premier League 2024 (Jan 15 - Dec 20, 2024)
2. BRICS Cup 2024 (Mar 1 - Jun 30, 2024)

### Matches
1. FC Bujumbura vs Vital'O FC - Feb 10, 2024 @ 15:00
2. Le Messager Ngozi vs Aigle Noir - Feb 11, 2024 @ 17:00
3. FC Bujumbura vs Le Messager Ngozi - Mar 15, 2024 @ 14:00
4. Vital'O FC vs Aigle Noir - Mar 16, 2024 @ 16:00

## API Endpoints Summary

### Competitions
- `GET /api/competitions` - List all competitions
- `POST /api/competitions` - Create competition (Admin/Secretariat)
- `GET /api/competitions/:id` - Get competition details
- `PUT /api/competitions/:id` - Update competition (Admin/Secretariat)
- `DELETE /api/competitions/:id` - Delete competition (Admin)

### Matches
- `GET /api/matches` - List all matches
- `POST /api/matches` - Create match (Admin/Secretariat)
- `GET /api/matches/:id` - Get match details
- `PUT /api/matches/:id` - Update match (Admin/Secretariat/Referee)
- `DELETE /api/matches/:id` - Delete match (Admin)

### Reports (Disciplinary)
- `POST /api/reports` - Create report (Referee/Admin)
- `GET /api/reports` - List reports (Secretariat/Admin)
- `GET /api/reports/:id` - Get report details (Referee/Secretariat/Admin)
- `PUT /api/reports/:id` - Update report (Referee/Admin)

## Next Steps

1. **Run the seed script** to populate test data
2. **Restart the backend** to load the new routes
3. **Test referee report creation** from referee dashboard
4. **Verify reports appear** in secretariat dashboard
5. **Test multi-language** switching on frontend

## Troubleshooting

### Reports not appearing?
- Check if routes are registered: Look for "✅ Mounted /api/reports routes" in console
- Verify auth token is valid
- Check user role is REFEREE, SECRETARIAT, or ADMIN

### Competitions not showing?
- Run seed script: `node backend/seed-competitions.js`
- Check database connection
- Verify Prisma schema is up to date: `npx prisma generate`

### Language files missing?
- All translation files are in: `frontend/src/i18n/locales/`
- Restart frontend if changes don't appear

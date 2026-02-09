# Referee Assignment & Report Viewing Feature

## Overview
This feature allows the secretariat to assign referees to matches and view submitted disciplinary reports on their dashboard.

## Implementation Summary

### Backend Changes

#### 1. Match Controller (`backend/src/controllers/matchController.js`)
Added two new functions:
- `assignReferee`: Creates a match assignment linking a referee to a match
- `getMatchAssignments`: Retrieves all referee assignments for a specific match

#### 2. Match Routes (`backend/src/routes/matchRoutes.js`)
Added two new endpoints:
- `POST /api/matches/assign-referee` - Assign a referee to a match (SECRETARIAT/ADMIN only)
- `GET /api/matches/:matchId/assignments` - Get all assignments for a match

#### 3. Main Server (`backend/src/index.js`)
- Imported and mounted the match routes at `/api/matches`

### Frontend Changes

#### Secretariat Dashboard (`frontend/src/app/secretariat/page.tsx`)
Enhanced with:

**New Features:**
1. **Referee Assignment Section**
   - Dropdown to select a match (shows home vs away team and date)
   - Dropdown to select a referee (shows name and certification)
   - Assign button to create the assignment

2. **Submitted Reports Section**
   - Displays all disciplinary reports with status "SUBMITTED"
   - Shows match details, referee name, incident type, action taken
   - Displays player involved, minute of incident, and description
   - Auto-refreshes on page load

**Dashboard Stats:**
- Total matches count
- Total referees count
- Pending reports count
- Teams count

### API Endpoints

#### Referee Assignment
```
POST /api/matches/assign-referee
Authorization: Bearer <token>
Role: SECRETARIAT, ADMIN

Body:
{
  "matchId": "uuid",
  "refereeId": "uuid",
  "role": "MAIN_REFEREE" // Optional, defaults to MAIN_REFEREE
}

Response:
{
  "id": "uuid",
  "matchId": "uuid",
  "refereeId": "uuid",
  "role": "MAIN_REFEREE",
  "status": "PENDING",
  "match": { ... },
  "referee": { ... }
}
```

#### Get Referees List
```
GET /api/referees
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "licenseNumber": "REF001",
    "certification": "FIFA Level 1",
    "experience": 5,
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
]
```

#### Get Matches List
```
GET /api/matches
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "homeTeam": { "name": "Team A" },
    "awayTeam": { "name": "Team B" },
    "scheduledAt": "2024-02-15T15:00:00Z",
    "venue": "Stadium A",
    "status": "SCHEDULED",
    "assignments": [...]
  }
]
```

#### Get Disciplinary Reports
```
GET /api/referees/reports?status=SUBMITTED
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "incident": "Violent Conduct",
    "action": "RED_CARD",
    "minute": 45,
    "description": "Player kicked opponent",
    "status": "SUBMITTED",
    "match": {
      "homeTeam": { "name": "Team A" },
      "awayTeam": { "name": "Team B" }
    },
    "referee": {
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "player": {
      "firstName": "Mike",
      "lastName": "Smith"
    }
  }
]
```

## Database Schema

The feature uses existing Prisma models:

### MatchAssignment
```prisma
model MatchAssignment {
  id        String   @id @default(uuid())
  matchId   String
  match     Match    @relation(fields: [matchId], references: [id])
  refereeId String
  referee   Referee  @relation(fields: [refereeId], references: [id])
  role      RefereeRole
  status    AssignmentStatus
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### DisciplinaryReport
```prisma
model DisciplinaryReport {
  id          String   @id @default(uuid())
  matchId     String
  match       Match    @relation(fields: [matchId], references: [id])
  refereeId   String
  referee     Referee  @relation(fields: [refereeId], references: [id])
  playerId    String?
  player      Athlete? @relation(fields: [playerId], references: [id])
  incident    String
  action      DisciplinaryAction
  minute      Int?
  description String
  status      ReportStatus
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Testing

### Prerequisites
1. Backend running on `http://localhost:5000`
2. Frontend running on `http://localhost:3000`
3. Database with migrations applied
4. At least one referee registered
5. At least one match created

### Test Steps

1. **Login as Secretariat**
   - Navigate to `/login`
   - Use secretariat credentials

2. **Assign Referee to Match**
   - Go to secretariat dashboard
   - Select a match from the dropdown
   - Select a referee from the dropdown
   - Click "Assign Referee"
   - Verify success message

3. **View Submitted Reports**
   - Reports should automatically load on dashboard
   - Verify all report details are displayed correctly
   - Check that only SUBMITTED reports are shown

## Future Enhancements

1. **Referee Availability Check**
   - Prevent assigning referees who are unavailable
   - Show referee schedule conflicts

2. **Report Approval Workflow**
   - Add approve/reject buttons for reports
   - Send notifications to referees

3. **Assignment Notifications**
   - Email/SMS notifications to referees when assigned
   - Reminder notifications before match

4. **Referee Performance Tracking**
   - Track referee statistics
   - Generate performance reports

5. **Bulk Assignment**
   - Assign multiple referees to multiple matches
   - Auto-assign based on availability and experience

## Notes

- All API endpoints require authentication via JWT token
- Role-based access control is enforced (SECRETARIAT and ADMIN roles)
- The frontend uses React hooks for state management
- Error handling is implemented for all API calls
- The UI is responsive and mobile-friendly

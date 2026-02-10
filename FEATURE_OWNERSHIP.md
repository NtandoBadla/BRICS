# BIFA Platform - Feature Ownership & Technical Specifications

## 🏗️ Feature Ownership Structure

### **Feature 1: Referee Registry + Disciplinary Reporting**
**Owner:** Pair A
**Scope:** Referee management, match assignments, disciplinary actions, misconduct reporting

#### User Stories:
- As a **Referee**, I can register and maintain my profile with certifications
- As a **Referee**, I can view my assigned matches and accept/decline assignments
- As a **Referee**, I can submit misconduct reports during/after matches
- As a **Referee**, I can record disciplinary actions (yellow/red cards, suspensions)
- As a **Secretariat**, I can assign referees to matches based on availability
- As a **Secretariat**, I can review and approve disciplinary reports
- As a **Admin**, I can manage referee certifications and qualifications
- As a **Federation Official**, I can view disciplinary statistics and trends

#### Database Models:
```prisma
model Referee {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  licenseNumber String   @unique
  certification String
  experience    Int
  availability  Json
  assignments   MatchAssignment[]
  reports       DisciplinaryReport[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

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

enum RefereeRole {
  MAIN_REFEREE
  ASSISTANT_REFEREE
  FOURTH_OFFICIAL
  VAR_REFEREE
}

enum AssignmentStatus {
  PENDING
  ACCEPTED
  DECLINED
  CONFIRMED
}

enum DisciplinaryAction {
  YELLOW_CARD
  RED_CARD
  SUSPENSION
  FINE
  WARNING
}

enum ReportStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
}
```

#### API Endpoints:
```javascript
// Referee Management
POST   /api/referees                    // Register referee
GET    /api/referees                    // List referees
GET    /api/referees/:id                // Get referee details
PUT    /api/referees/:id                // Update referee profile
DELETE /api/referees/:id                // Remove referee

// Match Assignments
GET    /api/referees/:id/assignments    // Get referee assignments
POST   /api/assignments                 // Create assignment
PUT    /api/assignments/:id/accept      // Accept assignment
PUT    /api/assignments/:id/decline     // Decline assignment

// Disciplinary Reports
POST   /api/disciplinary/reports        // Submit report
GET    /api/disciplinary/reports        // List reports
GET    /api/disciplinary/reports/:id    // Get report details
PUT    /api/disciplinary/reports/:id    // Update report
PUT    /api/disciplinary/reports/:id/approve // Approve report
```

---

### **Feature 2: Competition + Match + Stats Engine**
**Owner:** Pair B
**Scope:** Competition management, match scheduling, live scoring, statistics tracking

#### User Stories:
- As a **Secretariat**, I can create and manage competitions/tournaments
- As a **Secretariat**, I can schedule matches and manage fixtures
- As a **Team Manager**, I can view my team's fixtures and results
- As a **Referee**, I can record live match events and scores
- As a **Admin**, I can generate match statistics and reports
- As a **Federation Official**, I can view competition standings and analytics
- As a **Public User**, I can view live scores and match results
- As a **Team Manager**, I can submit team lineups before matches

#### Database Models:
```prisma
model Competition {
  id          String            @id @default(uuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  location    String
  status      CompetitionStatus @default(DRAFT)
  format      CompetitionFormat
  matches     Match[]
  standings   Standing[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model Match {
  id            String              @id @default(uuid())
  competitionId String
  competition   Competition         @relation(fields: [competitionId], references: [id])
  homeTeamId    String
  homeTeam      Team                @relation("HomeMatches", fields: [homeTeamId], references: [id])
  awayTeamId    String
  awayTeam      Team                @relation("AwayMatches", fields: [awayTeamId], references: [id])
  scheduledAt   DateTime
  venue         String
  status        MatchStatus         @default(SCHEDULED)
  homeScore     Int?
  awayScore     Int?
  events        MatchEvent[]
  assignments   MatchAssignment[]
  reports       DisciplinaryReport[]
  statistics    MatchStatistic[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}

model MatchEvent {
  id        String    @id @default(uuid())
  matchId   String
  match     Match     @relation(fields: [matchId], references: [id])
  playerId  String?
  player    Athlete?  @relation(fields: [playerId], references: [id])
  teamId    String
  team      Team      @relation(fields: [teamId], references: [id])
  type      EventType
  minute    Int
  details   String?
  createdAt DateTime  @default(now())
}

model MatchStatistic {
  id       String @id @default(uuid())
  matchId  String
  match    Match  @relation(fields: [matchId], references: [id])
  teamId   String
  team     Team   @relation(fields: [teamId], references: [id])
  statType String
  value    Int
}

model Standing {
  id            String      @id @default(uuid())
  competitionId String
  competition   Competition @relation(fields: [competitionId], references: [id])
  teamId        String
  team          Team        @relation(fields: [teamId], references: [id])
  position      Int
  played        Int         @default(0)
  won           Int         @default(0)
  drawn         Int         @default(0)
  lost          Int         @default(0)
  goalsFor      Int         @default(0)
  goalsAgainst  Int         @default(0)
  goalDiff      Int         @default(0)
  points        Int         @default(0)
  updatedAt     DateTime    @updatedAt
}

enum CompetitionFormat {
  LEAGUE
  KNOCKOUT
  GROUP_STAGE
  ROUND_ROBIN
}

enum MatchStatus {
  SCHEDULED
  LIVE
  HALF_TIME
  FULL_TIME
  POSTPONED
  CANCELLED
}

enum EventType {
  GOAL
  YELLOW_CARD
  RED_CARD
  SUBSTITUTION
  PENALTY
  OWN_GOAL
  KICK_OFF
  HALF_TIME
  FULL_TIME
}
```

#### API Endpoints:
```javascript
// Competition Management
POST   /api/competitions               // Create competition
GET    /api/competitions               // List competitions
GET    /api/competitions/:id           // Get competition details
PUT    /api/competitions/:id           // Update competition
DELETE /api/competitions/:id           // Delete competition
GET    /api/competitions/:id/standings // Get standings

// Match Management
POST   /api/matches                    // Create match
GET    /api/matches                    // List matches
GET    /api/matches/:id                // Get match details
PUT    /api/matches/:id                // Update match
DELETE /api/matches/:id                // Delete match
GET    /api/matches/live               // Get live matches

// Match Events & Statistics
POST   /api/matches/:id/events         // Record match event
GET    /api/matches/:id/events         // Get match events
POST   /api/matches/:id/statistics     // Record statistics
GET    /api/matches/:id/statistics     // Get match statistics
PUT    /api/matches/:id/score          // Update score
```

---

### **Feature 3: CMS + Website + Multilingual UI**
**Owner:** Individual C
**Scope:** Content management, public website, multi-language support, news/articles

#### User Stories:
- As a **Admin**, I can create and manage website content (news, articles, pages)
- As a **Secretariat**, I can publish competition announcements and updates
- As a **Public User**, I can browse news and articles in my preferred language
- As a **Public User**, I can switch between English and French interfaces
- As a **Admin**, I can manage media files and images
- As a **Federation Official**, I can publish official statements and documents
- As a **Public User**, I can search for content and filter by categories
- As a **Admin**, I can manage website navigation and menus

#### Database Models:
```prisma
model Content {
  id          String        @id @default(uuid())
  title       String
  slug        String        @unique
  content     String
  excerpt     String?
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  type        ContentType
  status      ContentStatus @default(DRAFT)
  language    String        @default("en")
  featuredImage String?
  tags        String[]
  category    String?
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  translations ContentTranslation[]
}

model ContentTranslation {
  id        String  @id @default(uuid())
  contentId String
  content   Content @relation(fields: [contentId], references: [id])
  language  String
  title     String
  content   String
  excerpt   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([contentId, language])
}

model Media {
  id          String    @id @default(uuid())
  filename    String
  originalName String
  mimeType    String
  size        Int
  url         String
  alt         String?
  uploadedBy  String
  uploader    User      @relation(fields: [uploadedBy], references: [id])
  createdAt   DateTime  @default(now())
}

model Page {
  id        String      @id @default(uuid())
  title     String
  slug      String      @unique
  content   String
  template  String?
  status    PageStatus  @default(DRAFT)
  language  String      @default("en")
  metaTitle String?
  metaDescription String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

enum ContentType {
  NEWS
  ARTICLE
  ANNOUNCEMENT
  DOCUMENT
  PRESS_RELEASE
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

#### API Endpoints:
```javascript
// Content Management
POST   /api/content                    // Create content
GET    /api/content                    // List content
GET    /api/content/:slug              // Get content by slug
PUT    /api/content/:id                // Update content
DELETE /api/content/:id                // Delete content
POST   /api/content/:id/publish        // Publish content

// Media Management
POST   /api/media/upload               // Upload media
GET    /api/media                      // List media files
GET    /api/media/:id                  // Get media details
DELETE /api/media/:id                  // Delete media

// Pages Management
POST   /api/pages                      // Create page
GET    /api/pages                      // List pages
GET    /api/pages/:slug                // Get page by slug
PUT    /api/pages/:id                  // Update page
DELETE /api/pages/:id                  // Delete page

// Public API
GET    /api/public/content             // Get published content
GET    /api/public/content/:slug       // Get public content
GET    /api/public/pages/:slug         // Get public page
GET    /api/public/search              // Search content
```

---

### **Feature 4: Secretariat Workflows + Governance Portal**
**Owner:** Individual D
**Scope:** Administrative workflows, document management, governance processes, approvals

#### User Stories:
- As a **Secretariat**, I can manage team registrations and approvals
- As a **Secretariat**, I can process referee applications and certifications
- As a **Secretariat**, I can generate official documents and certificates
- As a **Admin**, I can configure workflow approval processes
- As a **Federation Official**, I can review and approve governance decisions
- As a **Team Manager**, I can submit registration documents and track status
- As a **Secretariat**, I can manage meeting schedules and minutes
- As a **Admin**, I can audit system activities and generate reports

#### Database Models:
```prisma
model Workflow {.env
  id          String         @id @default(uuid())
  name        String
  description String?
  type        WorkflowType
  steps       WorkflowStep[]
  instances   WorkflowInstance[]
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model WorkflowStep {
  id         String     @id @default(uuid())
  workflowId String
  workflow   Workflow   @relation(fields: [workflowId], references: [id])
  name       String
  order      Int
  assignedRole String
  isRequired Boolean    @default(true)
  actions    StepAction[]
}

model WorkflowInstance {
  id         String              @id @default(uuid())
  workflowId String
  workflow   Workflow            @relation(fields: [workflowId], references: [id])
  entityType String
  entityId   String
  status     WorkflowStatus      @default(PENDING)
  currentStep Int                @default(1)
  submittedBy String
  submitter  User                @relation(fields: [submittedBy], references: [id])
  actions    WorkflowAction[]
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt
}

model WorkflowAction {
  id         String           @id @default(uuid())
  instanceId String
  instance   WorkflowInstance @relation(fields: [instanceId], references: [id])
  stepId     String
  step       WorkflowStep     @relation("StepAction", fields: [stepId], references: [id])
  actionBy   String
  actor      User             @relation(fields: [actionBy], references: [id])
  action     ActionType
  comment    String?
  createdAt  DateTime         @default(now())
}

model Document {
  id          String         @id @default(uuid())
  name        String
  type        DocumentType
  content     String?
  fileUrl     String?
  templateId  String?
  template    DocumentTemplate? @relation(fields: [templateId], references: [id])
  entityType  String?
  entityId    String?
  status      DocumentStatus @default(DRAFT)
  createdBy   String
  creator     User           @relation(fields: [createdBy], references: [id])
  approvedBy  String?
  approver    User?          @relation("DocumentApprover", fields: [approvedBy], references: [id])
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model DocumentTemplate {
  id        String     @id @default(uuid())
  name      String
  content   String
  variables Json
  type      DocumentType
  isActive  Boolean    @default(true)
  documents Document[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  entityType String
  entityId  String
  oldValues Json?
  newValues Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}

enum WorkflowType {
  TEAM_REGISTRATION
  REFEREE_APPLICATION
  DISCIPLINARY_REVIEW
  DOCUMENT_APPROVAL
  COMPETITION_APPROVAL
}

enum WorkflowStatus {
  PENDING
  IN_PROGRESS
  APPROVED
  REJECTED
  CANCELLED
}

enum ActionType {
  APPROVE
  REJECT
  REQUEST_CHANGES
  COMMENT
  FORWARD
}

enum DocumentType {
  CERTIFICATE
  REGISTRATION
  REPORT
  MINUTES
  POLICY
  FORM
}

enum DocumentStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  ARCHIVED
}
```

#### API Endpoints:
```javascript
// Workflow Management
POST   /api/workflows                  // Create workflow
GET    /api/workflows                  // List workflows
GET    /api/workflows/:id              // Get workflow details
PUT    /api/workflows/:id              // Update workflow
DELETE /api/workflows/:id              // Delete workflow

// Workflow Instances
POST   /api/workflow-instances         // Start workflow instance
GET    /api/workflow-instances         // List instances
GET    /api/workflow-instances/:id     // Get instance details
POST   /api/workflow-instances/:id/action // Take action on instance

// Document Management
POST   /api/documents                  // Create document
GET    /api/documents                  // List documents
GET    /api/documents/:id              // Get document details
PUT    /api/documents/:id              // Update document
DELETE /api/documents/:id              // Delete document
POST   /api/documents/:id/approve      // Approve document
POST   /api/documents/generate         // Generate from template

// Templates
POST   /api/document-templates         // Create template
GET    /api/document-templates         // List templates
GET    /api/document-templates/:id     // Get template details
PUT    /api/document-templates/:id     // Update template

// Audit & Reporting
GET    /api/audit-logs                 // Get audit logs
GET    /api/reports/activity           // Activity reports
GET    /api/reports/workflows          // Workflow reports
```

---

## 🚀 Next Steps

1. **Update Prisma Schema** with all models
2. **Generate Prisma Client** and run migrations
3. **Create Controller Stubs** for each feature
4. **Set up Route Files** for each feature area
5. **Implement Authentication Middleware** for role-based access
6. **Create Frontend Components** for each user role
7. **Set up Testing Framework** for each feature

Each feature owner should focus on their assigned area while maintaining API consistency and following the established authentication patterns.
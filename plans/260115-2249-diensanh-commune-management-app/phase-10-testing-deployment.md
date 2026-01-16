# Phase 10: Testing & Deployment

## Context Links
- [Plan Overview](./plan.md)
- Firebase Console: https://console.firebase.google.com/project/diensanh-37701

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | pending |
| Effort | 8h |
| Dependencies | Phase 01-09 complete |

Comprehensive testing, Firebase Hosting deployment, and production monitoring.

---

## Key Insights
- **Frontend: Vercel** (Validated Decision) - Better DX, preview deployments
- **Backend: Cloud Run** (Validated Decision) - Serverless, auto-scale
- Firestore security rules testing critical
- Full rollout to all 20 villages from day one
- Firestore scheduled exports for backup

---

## Requirements

### Functional
- FR1: All features tested manually
- FR2: Security rules tested
- FR3: Deploy frontend to Vercel
- FR4: Deploy backend to Cloud Run

### Non-Functional
- NFR1: Lighthouse score > 90 (Performance, PWA)
- NFR2: No console errors in production
- NFR3: HTTPS enforced
- NFR4: Monitoring/alerting configured

---

## Architecture

### Deployment Architecture
```
┌─────────────────────────────────────────────────────┐
│                     Vercel                           │
│               (diensanh.vercel.app)                 │
│                                                      │
│  ┌───────────────┐     ┌────────────────────────┐  │
│  │ React PWA     │────▶│ Firebase Auth/Firestore│  │
│  │ (Static)      │     │ (Direct connection)    │  │
│  └───────────────┘     └────────────────────────┘  │
│          │                                          │
│          │ /api/* proxy                             │
│          ▼                                          │
│  ┌───────────────────────────────────────────────┐ │
│  │ FastAPI Backend (Cloud Run / VPS)              │ │
│  │ - /api/chat (RAG chatbot)                      │ │
│  │ - /api/sms/* (SMS integration)                 │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Environment Configuration
```
Production:
  - Frontend: Vercel
  - Backend: Cloud Run
  - Database: Firestore (Production)
  - Auth: Firebase Auth

Staging:
  - Frontend: Vercel Preview Deployments
  - Backend: Cloud Run (staging instance)
  - Database: Firestore (same project, can use emulator)
```

---

## Related Code Files

### Create
- `vercel.json` - Vercel configuration with rewrites
- `Dockerfile` - FastAPI container for Cloud Run
- `cloudbuild.yaml` - Cloud Build configuration
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Indexes
- `scripts/deploy-cloudrun.sh` - Cloud Run deploy script
- `tests/` - Test files
- `.github/workflows/deploy.yml` - CI/CD

### Modify
- `vite.config.ts` - Production build config
- `.env.production` - Production env vars

---

## Implementation Steps

### 1. Configure Vercel Deployment (1h)
```json
// vercel.json
{
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://diensanh-api-xxx.asia-southeast1.run.app/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### 2. Create Cloud Run Dockerfile (1h)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY data/ ./data/

# Set environment variables
ENV PORT=8080
ENV PYTHONPATH=/app

# Run the application
CMD ["uvicorn", "src.api.api-server:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 3. Create Cloud Run Deploy Script (0.5h)
```bash
#!/bin/bash
# scripts/deploy-cloudrun.sh

set -e

PROJECT_ID="diensanh-37701"
SERVICE_NAME="diensanh-api"
REGION="asia-southeast1"

echo "Building and deploying to Cloud Run..."

# Build and push container
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="AI4U_API_KEY=$AI4U_API_KEY" \
  --set-env-vars="ESMS_API_KEY=$ESMS_API_KEY" \
  --set-env-vars="ESMS_SECRET_KEY=$ESMS_SECRET_KEY" \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=10

echo "Deployment complete!"
echo "URL: https://$SERVICE_NAME-xxx.$REGION.run.app"
```

### 4. Setup Firestore Scheduled Exports (0.5h)
```bash
# Enable Cloud Scheduler and create backup job
gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/diensanh-37701/databases/(default):exportDocuments" \
  --message-body='{"outputUriPrefix":"gs://diensanh-37701-backups/firestore"}' \
  --oauth-service-account-email="firebase-adminsdk@diensanh-37701.iam.gserviceaccount.com" \
  --time-zone="Asia/Saigon"
```

### 5. Test Security Rules (1.5h)
```typescript
// tests/firestore.rules.test.ts
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'

describe('Firestore Rules', () => {
  let testEnv: RulesTestEnvironment

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'diensanh-37701',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') }
    })
  })

  describe('Villages', () => {
    it('admin can read all villages', async () => {
      const adminDb = testEnv.authenticatedContext('admin-uid', { role: 'commune_admin' }).firestore()
      await assertSucceeds(adminDb.collection('villages').get())
    })

    it('village leader can only read own village', async () => {
      const leaderDb = testEnv.authenticatedContext('leader-uid', {
        role: 'village_leader',
        villageId: 'thon-01'
      }).firestore()

      await assertSucceeds(leaderDb.doc('villages/thon-01').get())
    })

    it('unauthenticated cannot read villages', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()
      await assertFails(unauthedDb.collection('villages').get())
    })
  })

  describe('Households', () => {
    it('admin can CRUD any household', async () => {
      const adminDb = testEnv.authenticatedContext('admin-uid', { role: 'commune_admin' }).firestore()
      await assertSucceeds(
        adminDb.collection('villages/thon-01/households').add({ headName: 'Test' })
      )
    })

    it('village leader can only CRUD own village households', async () => {
      const leaderDb = testEnv.authenticatedContext('leader-uid', {
        role: 'village_leader',
        villageId: 'thon-01'
      }).firestore()

      await assertSucceeds(
        leaderDb.collection('villages/thon-01/households').get()
      )
      await assertFails(
        leaderDb.collection('villages/thon-02/households').get()
      )
    })
  })

  describe('Requests', () => {
    it('anyone can create request', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()
      await assertSucceeds(
        unauthedDb.collection('requests').add({
          title: 'Test',
          submitterPhone: '0912345678'
        })
      )
    })
  })
})
```

### 4. Manual Testing Checklist (1.5h)

**Authentication:**
- [ ] Phone OTP login works
- [ ] Session persists after refresh
- [ ] Role-based redirect works
- [ ] Logout clears session

**Admin Dashboard:**
- [ ] Stats display correctly
- [ ] Navigation works
- [ ] Responsive on mobile

**Village Management:**
- [ ] List all 20 villages
- [ ] Filter by region
- [ ] Assign leader works

**Household Management:**
- [ ] Add household
- [ ] Edit household
- [ ] Add resident
- [ ] Search works
- [ ] Excel import works

**SMS System:**
- [ ] Compose SMS
- [ ] Select recipients
- [ ] Send single SMS
- [ ] Send bulk SMS
- [ ] View history

**Tasks:**
- [ ] Create task
- [ ] Assign to villages
- [ ] Village leader sees assigned
- [ ] Submit report

**Public Portal:**
- [ ] View announcements
- [ ] Submit request
- [ ] Track request
- [ ] Chatbot works

**PWA:**
- [ ] Install prompt appears
- [ ] Offline indicator works
- [ ] Offline data loads
- [ ] Sync when back online

### 5. Lighthouse Audit (0.5h)
```bash
# Run Lighthouse CLI
npx lighthouse https://diensanh-37701.web.app \
  --output=html \
  --output-path=./lighthouse-report.html \
  --chrome-flags="--headless"

# Target scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
# PWA: Pass all checks
```

### 6. Deploy Firestore Rules (0.5h)
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 7. Production Environment Setup (1h)
```bash
# .env.production
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=diensanh-37701.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=diensanh-37701
VITE_FIREBASE_STORAGE_BUCKET=diensanh-37701.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_API_BASE_URL=https://api.diensanh.gov.vn
```

### 8. Setup CI/CD with GitHub Actions (1h)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./web

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Auth to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup gcloud
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        run: |
          gcloud builds submit --tag gcr.io/diensanh-37701/diensanh-api
          gcloud run deploy diensanh-api \
            --image gcr.io/diensanh-37701/diensanh-api \
            --platform managed \
            --region asia-southeast1 \
            --allow-unauthenticated
```

### 9. Setup Monitoring (0.5h)
- Enable Firebase Performance Monitoring
- Enable Firebase Crashlytics (if using)
- Setup billing alerts
- Configure error reporting

---

## Todo List
- [ ] Configure vercel.json
- [ ] Create Cloud Run Dockerfile
- [ ] Create deploy-cloudrun.sh script
- [ ] Setup Firestore scheduled exports
- [ ] Write Firestore rules tests
- [ ] Run security rules tests
- [ ] Manual test all features
- [ ] Run Lighthouse audit
- [ ] Fix any Lighthouse issues
- [ ] Setup production env vars (Vercel + GCP)
- [ ] Build production bundle
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Cloud Run
- [ ] Deploy Firestore rules
- [ ] Verify deployments
- [ ] Setup GitHub Actions CI/CD
- [ ] Configure monitoring
- [ ] Document deployment process

---

## Success Criteria
- [ ] All manual tests pass
- [ ] Security rules tests pass
- [ ] Lighthouse scores > 90
- [ ] Vercel production deployment successful
- [ ] Cloud Run deployment successful
- [ ] CI/CD pipeline works
- [ ] Custom domain configured (if ready)
- [ ] Monitoring enabled

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Security vulnerability | Critical | Thorough rules testing |
| Deploy downtime | Medium | Use preview channels first |
| Performance regression | Medium | Lighthouse CI checks |

---

## Security Considerations
- Verify no secrets in git
- Review Firestore rules thoroughly
- Test unauthorized access attempts
- Enable Firebase App Check (future)

---

## Post-Deployment

### Monitoring Dashboard
- Firebase Console → Analytics
- Firebase Console → Performance
- Firebase Console → Crashlytics

### Rollback Procedure
```bash
# Vercel: Rollback to previous deployment
vercel rollback

# Cloud Run: Rollback to previous revision
gcloud run services update-traffic diensanh-api \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=asia-southeast1
```

### Maintenance Tasks
- Weekly: Check error logs
- Monthly: Review usage metrics
- Quarterly: Security audit

---

## Unresolved Questions
1. Custom domain (diensanh.gov.vn) DNS configuration for Vercel?
2. SSL certificate for custom domain? (Vercel provides automatic SSL)
3. ~~FastAPI backend hosting location?~~ → **Resolved: Cloud Run**
4. ~~Backup strategy for Firestore data?~~ → **Resolved: Scheduled exports**

---

## Next Steps
After deployment:
1. User acceptance testing with commune staff
2. Training sessions for admin/village leaders
3. Gradual rollout (pilot village first)
4. Collect feedback for v1.1

# Phase 02: Firestore Schema & Security Rules

## Context Links
- [Plan Overview](./plan.md)
- [Phase 01: Foundation](./phase-01-foundation-auth-setup.md)
- Firebase Console: https://console.firebase.google.com/project/diensanh-37701

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 - Critical Path |
| Status | pending |
| Effort | 10h |
| Dependencies | Phase 01 complete |

Define Firestore data model, security rules, and initial data seeding for 20 villages.

---

## Key Insights
- Flat structure preferred over deep nesting (Firestore charges per document read)
- Security rules must handle offline writes (pending writes queue)
- Use subcollections for one-to-many (village→households)
- Composite indexes needed for complex queries

---

## Requirements

### Functional
- FR1: Store village data (18 thon + 2 KDC)
- FR2: Store household/resident data per village
- FR3: Store user roles and permissions
- FR4: Support offline read/write for cached data

### Non-Functional
- NFR1: Query latency <200ms for dashboard
- NFR2: Security rules prevent unauthorized access
- NFR3: Support 10,000+ households

---

## Architecture

### Firestore Collections

```
/users/{uid}
  - phone: string
  - displayName: string
  - role: "commune_admin" | "village_leader" | "resident"
  - villageId?: string  // For village leaders
  - createdAt: timestamp
  - updatedAt: timestamp

/villages/{villageId}
  - name: string
  - code: string  // e.g., "thon-01"
  - region: "dien_sanh_cu" | "hai_truong" | "hai_dinh"
  - type: "thon" | "kdc"
  - leaderId?: string  // uid of village leader
  - leaderName?: string
  - leaderPhone?: string
  - householdCount: number
  - residentCount: number
  - createdAt: timestamp
  - updatedAt: timestamp

/villages/{villageId}/households/{householdId}
  - code: string  // So ho khau
  - headName: string
  - headPhone?: string
  - address: string
  - memberCount: number
  - createdAt: timestamp
  - updatedAt: timestamp

/villages/{villageId}/households/{householdId}/residents/{residentId}
  - name: string
  - birthDate?: timestamp
  - gender: "male" | "female"
  - idNumberEncrypted?: string  // CCCD encrypted with AES-256-GCM (Validated Decision)
  - idNumberHash?: string       // SHA-256 hash for lookup without decryption
  - phone?: string
  - relationship: string  // Quan he voi chu ho
  - isHead: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

/tasks/{taskId}
  - title: string
  - description: string
  - type: "survey" | "notification" | "report" | "other"
  - status: "pending" | "in_progress" | "completed" | "cancelled"
  - priority: "low" | "medium" | "high"
  - assignedTo: string[]  // villageIds
  - createdBy: string  // uid
  - dueDate?: timestamp
  - completedAt?: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp

/tasks/{taskId}/reports/{reportId}
  - villageId: string
  - submittedBy: string  // uid
  - content: string
  - attachments?: string[]
  - submittedAt: timestamp

/messages/{messageId}
  - type: "sms" | "notification"
  - content: string
  - recipients: string[]  // phone numbers or villageIds
  - recipientType: "all" | "village" | "individual"
  - status: "queued" | "sent" | "delivered" | "failed"
  - provider?: string
  - providerId?: string
  - sentBy: string  // uid
  - sentAt?: timestamp
  - createdAt: timestamp

/requests/{requestId}
  - type: string  // Request type
  - title: string
  - description: string
  - status: "pending" | "processing" | "completed" | "rejected"
  - submittedBy: string  // uid or phone
  - submitterName: string
  - submitterPhone: string
  - assignedTo?: string  // uid
  - response?: string
  - createdAt: timestamp
  - updatedAt: timestamp

/announcements/{announcementId}
  - title: string
  - content: string
  - type: "news" | "policy" | "event" | "urgent"
  - publishedAt?: timestamp
  - expiresAt?: timestamp
  - isPublished: boolean
  - createdBy: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

---

## Related Code Files

### Create
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Composite indexes
- `scripts/seed-villages.ts` - Village seeding script

### Modify
- `firebase.json` - Add Firestore config

---

## Implementation Steps

### 1. Create Security Rules (3h)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'commune_admin';
    }

    function isVillageLeader(villageId) {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return user.data.role == 'village_leader' && user.data.villageId == villageId;
    }

    function isAdminOrVillageLeader(villageId) {
      return isAdmin() || isVillageLeader(villageId);
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAdmin() || request.auth.uid == userId;
      allow delete: if isAdmin();
    }

    // Villages collection
    match /villages/{villageId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();

      // Households subcollection
      match /households/{householdId} {
        allow read: if isAdminOrVillageLeader(villageId);
        allow write: if isAdminOrVillageLeader(villageId);

        // Residents subcollection
        match /residents/{residentId} {
          allow read: if isAdminOrVillageLeader(villageId);
          allow write: if isAdminOrVillageLeader(villageId);
        }
      }
    }

    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAdmin() ||
        (resource.data.assignedTo.hasAny([get(/databases/$(database)/documents/users/$(request.auth.uid)).data.villageId]));
      allow delete: if isAdmin();

      match /reports/{reportId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update, delete: if isAdmin() || request.auth.uid == resource.data.submittedBy;
      }
    }

    // Messages - admin only
    match /messages/{messageId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // Requests
    match /requests/{requestId} {
      allow read: if isAdmin() || request.auth.uid == resource.data.submittedBy;
      allow create: if true;  // Public can submit
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Announcements
    match /announcements/{announcementId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

### 2. Create Indexes (1h)

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "households",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "headName", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "announcements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublished", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 3. Seed Villages Script (2h)

Create `scripts/seed-villages.ts`:
```typescript
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const villages = [
  // Dien Sanh cu - 9 thon + 2 KDC
  { code: 'thon-01', name: 'Thôn 1', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-02', name: 'Thôn 2', region: 'dien_sanh_cu', type: 'thon' },
  // ... (all 18 thon + 2 KDC)
  { code: 'kdc-01', name: 'KDC 1', region: 'dien_sanh_cu', type: 'kdc' },
  { code: 'kdc-02', name: 'KDC 2', region: 'dien_sanh_cu', type: 'kdc' },
  // Hai Truong - 5 thon
  // Hai Dinh - 4 thon
]

async function seed() {
  const db = getFirestore()
  const batch = db.batch()

  for (const village of villages) {
    const ref = db.collection('villages').doc(village.code)
    batch.set(ref, {
      ...village,
      householdCount: 0,
      residentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  await batch.commit()
  console.log(`Seeded ${villages.length} villages`)
}
```

### 4. TypeScript Types (1.5h)

Create `web/src/types/firestore.ts`:
```typescript
export interface User {
  phone: string
  displayName: string
  role: 'commune_admin' | 'village_leader' | 'resident'
  villageId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Village {
  name: string
  code: string
  region: 'dien_sanh_cu' | 'hai_truong' | 'hai_dinh'
  type: 'thon' | 'kdc'
  leaderId?: string
  leaderName?: string
  leaderPhone?: string
  householdCount: number
  residentCount: number
  createdAt: Date
  updatedAt: Date
}

// ... other types
```

### 5. Firestore Hooks (2h)

Create `web/src/hooks/use-villages.ts`, `use-households.ts`, etc. with React Query integration.

### 6. Deploy & Test (0.5h)
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Todo List
- [ ] Write Firestore security rules
- [ ] Create composite indexes
- [ ] Build village seeding script
- [ ] Define TypeScript types for all collections
- [ ] Create React Query hooks for data fetching
- [ ] Deploy rules and indexes
- [ ] Test CRUD operations for each role
- [ ] Verify offline write queuing
- [ ] Install crypto-js and create encryption utils
- [ ] Test CCCD encryption/decryption

---

## Success Criteria
- [ ] Security rules prevent unauthorized access
- [ ] Admin can CRUD all collections
- [ ] Village leader can only access own village data
- [ ] Public users can read announcements and submit requests
- [ ] Offline writes queue correctly
- [ ] 20 villages seeded successfully

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Security rule bypass | Critical | Test with Firebase Emulator |
| Index not created | Medium | Test queries before deployment |
| Data migration issues | Medium | Create import validation script |

---

## Security Considerations
- **CCCD Encryption (Validated Decision):** Encrypt all CCCD data with AES-256-GCM
  - Encryption key stored in Firebase Secret Manager or env var
  - Hash stored separately for lookup without decryption
  - Decrypt only when displaying to authorized users
- Audit log for sensitive data access (future)
- Rate limiting on public endpoints
- Validate data format in security rules

### CCCD Encryption Implementation
```typescript
// web/src/lib/encryption.ts
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY

export function encryptCCCD(cccd: string): { encrypted: string; hash: string } {
  const encrypted = CryptoJS.AES.encrypt(cccd, ENCRYPTION_KEY).toString()
  const hash = CryptoJS.SHA256(cccd).toString()
  return { encrypted, hash }
}

export function decryptCCCD(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function hashCCCD(cccd: string): string {
  return CryptoJS.SHA256(cccd).toString()
}
```

---

## Next Steps
After completion:
1. → Phase 03: Admin Dashboard & Navigation
2. Import real village data from commune
3. Create admin user in Firestore

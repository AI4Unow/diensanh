/**
 * Village seeding script for Dien Sanh commune
 * Run with: npx ts-node scripts/seed-villages.ts
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as path from 'path'

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../diensanh-45eb1-firebase-adminsdk-fbsvc-bac6fef000.json')

// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceAccount = require(serviceAccountPath) as ServiceAccount

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

// Village data for Dien Sanh commune
// Based on: 18 thôn + 2 KDC across 3 former regions
const villages = [
  // Diên Sanh cũ - 9 thôn + 2 KDC = 11 units
  { code: 'thon-dinh-tho', name: 'Thôn Định Thọ', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-hoa', name: 'Thôn Định Hòa', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-mon', name: 'Thôn Định Môn', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-thanh', name: 'Thôn Định Thành', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-loc', name: 'Thôn Định Lộc', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-an', name: 'Thôn Định An', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-phong', name: 'Thôn Định Phong', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-trung', name: 'Thôn Định Trung', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'thon-dinh-son', name: 'Thôn Định Sơn', region: 'dien_sanh_cu', type: 'thon' },
  { code: 'kdc-dinh-tho', name: 'KDC Định Thọ', region: 'dien_sanh_cu', type: 'kdc' },
  { code: 'kdc-dinh-hoa', name: 'KDC Định Hòa', region: 'dien_sanh_cu', type: 'kdc' },

  // Hải Trường - 5 thôn
  { code: 'thon-truong-an', name: 'Thôn Trường An', region: 'hai_truong', type: 'thon' },
  { code: 'thon-truong-xuan', name: 'Thôn Trường Xuân', region: 'hai_truong', type: 'thon' },
  { code: 'thon-truong-son', name: 'Thôn Trường Sơn', region: 'hai_truong', type: 'thon' },
  { code: 'thon-truong-tho', name: 'Thôn Trường Thọ', region: 'hai_truong', type: 'thon' },
  { code: 'thon-truong-phuc', name: 'Thôn Trường Phúc', region: 'hai_truong', type: 'thon' },

  // Hải Định - 4 thôn
  { code: 'thon-dinh-hai', name: 'Thôn Định Hải', region: 'hai_dinh', type: 'thon' },
  { code: 'thon-dinh-binh', name: 'Thôn Định Bình', region: 'hai_dinh', type: 'thon' },
  { code: 'thon-dinh-phu', name: 'Thôn Định Phú', region: 'hai_dinh', type: 'thon' },
  { code: 'thon-dinh-vinh', name: 'Thôn Định Vĩnh', region: 'hai_dinh', type: 'thon' },
]

async function seedVillages() {
  console.log('Starting village seeding...')

  const batch = db.batch()
  const now = Timestamp.now()

  for (const village of villages) {
    const ref = db.collection('villages').doc(village.code)
    batch.set(ref, {
      ...village,
      householdCount: 0,
      residentCount: 0,
      createdAt: now,
      updatedAt: now
    })
    console.log(`  Adding: ${village.name} (${village.code})`)
  }

  await batch.commit()
  console.log(`\n✓ Successfully seeded ${villages.length} villages`)
  console.log(`  - Diên Sanh cũ: 9 thôn + 2 KDC`)
  console.log(`  - Hải Trường: 5 thôn`)
  console.log(`  - Hải Định: 4 thôn`)
}

// Run the seeding
seedVillages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding villages:', error)
    process.exit(1)
  })

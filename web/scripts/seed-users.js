
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Hardcoded config from .env.local to ensure script runs standalone without build step
const firebaseConfig = {
  apiKey: "AIzaSyD7X1EJmzjEeWx2kuLTTH-UbOAxT5YMOII",
  authDomain: "diensanh-45eb1.firebaseapp.com",
  projectId: "diensanh-45eb1",
  storageBucket: "diensanh-45eb1.firebasestorage.app",
  messagingSenderId: "847174741608",
  appId: "1:847174741608:web:86df47e099a0cc231f95dd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  { role: 'commune_admin', phone: '0900000000', pass: 'quantri123', name: 'Quản Trị Viên' },
  { role: 'village_leader', phone: '0900000001', pass: 'truongthon123', name: 'Trưởng Thôn 1', villageId: 'village-1' },
  { role: 'resident', phone: '0900000002', pass: 'nguoidan123', name: 'Người Dân A', villageId: 'village-1' }
];

async function seedUsers() {
  console.log('Starting user and data seeding...');

  for (const user of users) {
    const email = `${user.phone}@diensanh.local`;
    let userCredential;

    // 1. Create or Sign In
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, user.pass);
      console.log(`✅ Created Auth User: ${user.role} (${user.phone})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️  Auth User exists: ${user.phone}, signing in...`);
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, user.pass);
        } catch (signinError) {
          console.error(`❌ Failed to sign in as ${user.phone}:`, signinError.message);
          continue;
        }
      } else {
        console.error(`❌ Failed to create ${user.phone}:`, error.message);
        continue;
      }
    }

    if (!userCredential?.user) continue;
    const uid = userCredential.user.uid;

    // 2. Set Firestore Data (Profile)
    try {
      const userRef = doc(db, 'users', uid);
      const userData = {
        uid: uid,
        phone: user.phone,
        displayName: user.name,
        role: user.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(user.villageId ? { villageId: user.villageId } : {})
      };
      // Explicitly using merge: true
      await setDoc(userRef, userData, { merge: true });
      console.log(`✅ Set Firestore Profile: ${user.role}`);
    } catch (dbError) {
      console.error(`❌ Failed to set Firestore for ${user.phone}:`, dbError.message);
    }
  }

  console.log('Seeding complete. Press Ctrl+C to exit if script does not terminate.');
  process.exit(0);
}

seedUsers();

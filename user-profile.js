// user-profile.js
import { 
  db, 
  ref, 
  get, 
  set, 
  update, 
  onValue 
} from "./firebase-config.js";

// List of morally uplifting, high-taste sample bios (all under 100 words)
const MORAL_GOOD_TASTE_BIOS = [
  "Dedicated to fostering digital privacy, trust, and uplifting innovation. I believe in integrity, lifelong learning, and contributing positively to our digital community through shared knowledge, honor, and secure collaboration.",
  "Passionate about cybersecurity, ethics in technology, and building tools that empower individuals. Committed to kindness, mentorship, and continuous pursuit of excellence in all creative and professional endeavors.",
  "Enthusiastic advocate for privacy, digital safety, and human-centric design. Striving every day to make a meaningful difference, help others, and maintain high standards of respect and honesty in every interaction.",
  "Curious mind focused on software ethics, philosophy, and sustainable tech. Believer in open communication, noble principles, and using technology as a force for good to serve and inspire future generations.",
  "Deeply engaged in community volunteering, open-source software, and moral philosophy. Striving to cultivate empathy, environmental stewardship, and meaningful human connections."
];

// List of high-taste interest groups
const MORAL_INTEREST_GROUPS = [
  "Digital Privacy & Security, Classical Literature, Community Volunteering, Environmental Conservation, Ethics in AI",
  "Cybersecurity, Open Source Technology, Philosophy, Alpine Hiking, Musical Arts",
  "Data Protection, Mentorship, Sustainable Architecture, Acoustic Guitar, Mindfulness",
  "Information Security, Philanthropy, World History, Astronomy, Photography",
  "Robotics, Bioethics, Organic Gardening, Symphony Music, Youth Coaching"
];

// List of tasteful default names for user and friends
const MORAL_NAMES = [
  "Alexander Sterling",
  "Clara Montgomery",
  "Gabriel Vance",
  "Seraphina Hayes",
  "Julian Mercer",
  "Helena Fairchild",
  "Adrian Ross",
  "Evelyn Beaufort",
  "Marcus Thorne",
  "Genevieve Dupont",
  "Dominic Sterling",
  "Isabella Vance"
];

// Color palettes for 150x150 avatars
const AVATAR_BG_COLORS = ["6366F1", "10B981", "F59E0B", "EC4899", "8B5CF6", "38BDF8"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deriveNameFromEmail(email) {
  if (!email) return MORAL_NAMES[getRandomInt(0, MORAL_NAMES.length - 1)];
  const prefix = email.split('@')[0];
  const cleaned = prefix.replace(/[\._\d]+/g, ' ').trim();
  if (cleaned.length < 2) return MORAL_NAMES[getRandomInt(0, MORAL_NAMES.length - 1)];
  
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate default morally high and good taste user profile data
 */
export function generateDefaultProfile(user) {
  const name = deriveNameFromEmail(user.email);
  const randomAge = getRandomInt(18, 120);
  const bio = MORAL_GOOD_TASTE_BIOS[getRandomInt(0, MORAL_GOOD_TASTE_BIOS.length - 1)];
  const interests = MORAL_INTEREST_GROUPS[getRandomInt(0, MORAL_INTEREST_GROUPS.length - 1)];
  
  const encodedName = encodeURIComponent(name);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&size=150&background=6366F1&color=ffffff&bold=true&font-size=0.45`;

  return {
    uid: user.uid,
    email: user.email || "",
    name: name,
    avatarUrl: avatarUrl,
    bio: bio,
    age: randomAge,
    interests: interests,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generate 5 unique morally high, good taste friend profiles with 150x150 avatars
 */
export function generate5FriendProfiles() {
  const shuffledNames = [...MORAL_NAMES].sort(() => 0.5 - Math.random());
  const friends = [];

  for (let i = 0; i < 5; i++) {
    const friendName = shuffledNames[i % shuffledNames.length];
    const encodedName = encodeURIComponent(friendName);
    const bgColor = AVATAR_BG_COLORS[i % AVATAR_BG_COLORS.length];
    
    // 150x150 Avatar Picture URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&size=150&background=${bgColor}&color=ffffff&bold=true&font-size=0.45`;
    
    friends.push({
      id: "friend_" + Date.now() + "_" + (i + 1),
      name: friendName,
      avatarUrl: avatarUrl,
      age: getRandomInt(18, 120),
      bio: MORAL_GOOD_TASTE_BIOS[i % MORAL_GOOD_TASTE_BIOS.length],
      interests: MORAL_INTEREST_GROUPS[i % MORAL_INTEREST_GROUPS.length],
      createdAt: new Date().toISOString()
    });
  }

  return friends;
}

/**
 * Save / Get Profile & Friends from LocalStorage fallback
 */
function getLocalProfile(uid) {
  try {
    const raw = localStorage.getItem(`sharemind_profile_${uid}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalProfile(uid, profile) {
  try {
    localStorage.setItem(`sharemind_profile_${uid}`, JSON.stringify(profile));
  } catch (e) {
    console.error("LocalStorage save error:", e);
  }
}

function getLocalFriends(uid) {
  try {
    const raw = localStorage.getItem(`sharemind_friends_${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalFriends(uid, friends) {
  try {
    localStorage.setItem(`sharemind_friends_${uid}`, JSON.stringify(friends));
  } catch (e) {
    console.error("LocalStorage friends save error:", e);
  }
}

/**
 * Check if user profile exists in RTDB or LocalStorage, generate if missing, and return profile
 */
export async function getOrCreateUserProfile(user) {
  if (!user || !user.uid) return null;

  const uid = user.uid;
  const localProfile = getLocalProfile(uid);

  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const remoteData = snapshot.val();
      setLocalProfile(uid, remoteData);
      return remoteData;
    } else {
      const newProfile = localProfile || generateDefaultProfile(user);
      setLocalProfile(uid, newProfile);

      try {
        await set(userRef, newProfile);
      } catch (rtdbErr) {
        console.warn("RTDB write permission warning (falling back to LocalStorage):", rtdbErr.message);
      }

      return newProfile;
    }
  } catch (error) {
    console.warn("RTDB read warning (using LocalStorage fallback):", error.message);
    if (localProfile) {
      return localProfile;
    } else {
      const fallbackProfile = generateDefaultProfile(user);
      setLocalProfile(uid, fallbackProfile);
      return fallbackProfile;
    }
  }
}

/**
 * Create 5 Friends for the current user and save to Realtime Database / LocalStorage
 */
export async function create5UserFriends(uid) {
  if (!uid) return { success: false, error: "No user ID provided" };

  const existingFriends = getLocalFriends(uid);
  const new5Friends = generate5FriendProfiles();
  const updatedFriendsList = [...new5Friends, ...existingFriends];

  setLocalFriends(uid, updatedFriendsList);

  try {
    const friendsRef = ref(db, `users/${uid}/friends`);
    await set(friendsRef, updatedFriendsList);
    return { success: true, friends: updatedFriendsList, rtdbSynced: true };
  } catch (error) {
    console.warn("RTDB friends save warning (saved locally):", error.message);
    return { success: true, friends: updatedFriendsList, rtdbSynced: false };
  }
}

/**
 * Get Friends list for a user
 */
export async function getUserFriends(uid) {
  if (!uid) return [];
  const local = getLocalFriends(uid);

  try {
    const friendsRef = ref(db, `users/${uid}/friends`);
    const snapshot = await get(friendsRef);
    if (snapshot.exists()) {
      const remoteFriends = snapshot.val();
      setLocalFriends(uid, remoteFriends);
      return remoteFriends;
    }
  } catch (err) {
    console.warn("RTDB friends fetch warning (using LocalStorage):", err.message);
  }

  return local;
}

/**
 * Update user profile in Firebase Realtime Database and LocalStorage
 */
export async function updateUserProfile(uid, profileData) {
  if (!uid) return { success: false, error: "No user ID provided." };

  const updatedData = {
    ...profileData,
    updatedAt: new Date().toISOString()
  };

  const existingLocal = getLocalProfile(uid) || {};
  const mergedLocal = { ...existingLocal, ...updatedData };
  setLocalProfile(uid, mergedLocal);

  try {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, updatedData);
    return { success: true, rtdbSynced: true };
  } catch (error) {
    console.warn("Failed to sync profile update to RTDB (Saved locally):", error.message);
    return { 
      success: true, 
      rtdbSynced: false,
      warning: "Saved to local storage! (Enable Realtime Database rules in Firebase Console to sync across devices)." 
    };
  }
}

/**
 * Subscribe to realtime updates for a user's profile
 */
export function subscribeUserProfile(uid, callback) {
  if (!uid) return () => {};
  try {
    const userRef = ref(db, `users/${uid}`);
    return onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.val();
        setLocalProfile(uid, remoteData);
        callback(remoteData);
      }
    }, (error) => {
      console.warn("RTDB subscription listener warning:", error.message);
    });
  } catch (err) {
    console.warn("Failed to attach RTDB subscriber:", err);
    return () => {};
  }
}

/**
 * Subscribe to realtime updates for user's friends list
 */
export function subscribeUserFriends(uid, callback) {
  if (!uid) return () => {};
  try {
    const friendsRef = ref(db, `users/${uid}/friends`);
    return onValue(friendsRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteFriends = snapshot.val();
        setLocalFriends(uid, remoteFriends);
        callback(remoteFriends);
      }
    });
  } catch (err) {
    console.warn("Failed to attach RTDB friends subscriber:", err);
    return () => {};
  }
}

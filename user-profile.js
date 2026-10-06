// user-profile.js
import {
  db,
  ref,
  get,
  set,
  update,
  onValue
} from "./firebase-config.js";

// First Names Pool (25 names)
const FIRST_NAMES = [
  "Alexander", "Clara", "Gabriel", "Seraphina", "Julian",
  "Helena", "Adrian", "Evelyn", "Marcus", "Genevieve",
  "Dominic", "Isabella", "Sebastian", "Aurelia", "Nathaniel",
  "Vivienne", "Theodore", "Evangeline", "Cassian", "Rosalind",
  "Valentin", "Eleanor", "Oliver", "Cordelia", "Tristan"
];

// Last Names Pool (25 names) -> 25 * 25 = 625 unique name combinations
const LAST_NAMES = [
  "Sterling", "Montgomery", "Vance", "Hayes", "Mercer",
  "Fairchild", "Ross", "Beaufort", "Thorne", "Dupont",
  "Hawthorne", "St. Clair", "Kensington", "Sinclair", "Ainsworth",
  "Pembroke", "Lombard", "Vanderbilt", "Blackwood", "Kingsley",
  "Waverly", "Livingston", "Carmichael", "Barrington", "Ellington"
];

// Morally High & Good Taste Bio Sentence Components (all strictly < 100 words)
const BIO_MOTIVES = [
  "Dedicated to expanding digital privacy, open technology, and fostering genuine trust.",
  "Passionate about cybersecurity ethics, AI safety, and building software that empowers communities.",
  "Enthusiastic advocate for human-centric design, digital literacy, and environmental stewardship.",
  "Focused on moral philosophy, open-source collaboration, and lifelong learning.",
  "Committed to active community service, digital rights, and mentoring aspiring innovators.",
  "Striving to blend technology with sustainability, artistic expression, and noble principles.",
  "Advocating for software transparency, ethical data governance, and youth education.",
  "Engaged in digital rights research, environmental conservation, and social good initiatives."
];

const BIO_BELIEFS = [
  "I believe in integrity, empathy, and maintaining high moral standards in every endeavor.",
  "Guided by honor, transparency, and a deep commitment to helping others succeed.",
  "Firmly believing that technology should serve human dignity and elevate society.",
  "Dedicated to continuous self-improvement, kindness, and honest communication.",
  "Valuing mutual respect, curiosity, and ethical stewardship of shared digital resources.",
  "Believing in the power of collaboration, mentorship, and principled leadership."
];

// Wholesome High-Taste Interest Topics Pool
const INTEREST_TOPICS = [
  "Digital Privacy", "Cybersecurity", "Ethics in AI", "Open Source",
  "Classical Music", "Community Volunteering", "Environmental Conservation",
  "Alpine Hiking", "Philosophy", "Acoustic Guitar", "Mindfulness",
  "Data Protection", "Mentorship", "Sustainable Architecture", "World History",
  "Astronomy", "Photography", "Organic Gardening", "Symphony Music",
  "Youth Coaching", "Robotics", "Bioethics", "Chess & Logic",
  "Calligraphy", "Oceanography", "Renewable Energy", "Digital Art", "Literature"
];

// Vibrant background colors for 150x150 UI Avatars
const AVATAR_BG_COLORS = [
  "6366F1", "10B981", "F59E0B", "EC4899", "8B5CF6", "38BDF8",
  "14B8A6", "F43F5E", "64748B", "0EA5E9", "D97706", "059669"
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deriveNameFromEmail(email) {
  if (!email) {
    return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
  }
  const prefix = email.split('@')[0];
  const cleaned = prefix.replace(/[\._\d]+/g, ' ').trim();
  if (cleaned.length < 2) {
    return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
  }

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
  const bio = `${getRandomItem(BIO_MOTIVES)} ${getRandomItem(BIO_BELIEFS)}`;

  const shuffledInterests = [...INTEREST_TOPICS].sort(() => 0.5 - Math.random());
  const interests = shuffledInterests.slice(0, 3).join(", ");

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
 * AI RUNTIME GENERATOR:
 * Generates 5 unique morally high, good taste friend profiles dynamically at runtime
 * using the Replicate Proxy API with anthropic/claude-sonnet-5 model!
 */
export async function generate5FriendProfilesAI(existingFriends = []) {
  const existingNames = existingFriends.map(f => f.name).filter(Boolean).join(", ");

  const prompt = `Generate 5 completely unique, morally high, and good taste friend profiles as a valid JSON array of objects.
Do NOT repeat any of these existing names: [${existingNames}].
Respond ONLY with valid JSON inside a \`\`\`json ... \`\`\` block or raw JSON array without any conversational intro.

Each object in the JSON array MUST have these exact keys:
- name: string (Full Name)
- age: integer between 18 and 120
- bio: string (Inspiring self description, under 100 words, morally high and good taste)
- interests: string (3 to 5 comma-separated wholesome interests)
`;

  try {
    const response = await fetch("https://itp-ima-replicate-proxy.web.app/api/create_n_get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-5",
        input: {
          prompt: prompt
        }
      })
    });

    const data = await response.json();

    if (data && data.output) {
      const rawText = Array.isArray(data.output) ? data.output.join("") : data.output;

      const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const parsedProfiles = JSON.parse(jsonMatch[0]);

        return parsedProfiles.map((item, index) => {
          const friendName = item.name || `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
          const encodedName = encodeURIComponent(friendName);
          const bgColor = AVATAR_BG_COLORS[index % AVATAR_BG_COLORS.length];
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&size=150&background=${bgColor}&color=ffffff&bold=true&font-size=0.45`;

          return {
            id: "friend_ai_" + Date.now() + "_" + (index + 1) + "_" + Math.random().toString(36).substring(2, 6),
            name: friendName,
            avatarUrl: avatarUrl,
            age: item.age || getRandomInt(18, 120),
            bio: item.bio || "Dedicated to building a helpful, inspiring digital community.",
            interests: item.interests || "Digital Privacy, Community Volunteering",
            createdAt: new Date().toISOString()
          };
        });
      }
    }
  } catch (err) {
    console.warn("AI Runtime Generation notice (falling back to local unique generator):", err);
  }

  // Fallback to local unique generator if network fails
  return generate5FriendProfilesLocal(existingFriends);
}

/**
 * Local Fallback Unique Generator
 */
export function generate5FriendProfilesLocal(existingFriends = []) {
  const existingNames = new Set(existingFriends.map(f => f.name ? f.name.toLowerCase() : ""));
  const existingBios = new Set(existingFriends.map(f => f.bio ? f.bio.toLowerCase() : ""));

  const friends = [];
  const currentBatchNames = new Set();

  for (let i = 0; i < 5; i++) {
    let friendName = "";
    let attempts = 0;

    do {
      const first = getRandomItem(FIRST_NAMES);
      const last = getRandomItem(LAST_NAMES);
      friendName = `${first} ${last}`;
      attempts++;
    } while ((existingNames.has(friendName.toLowerCase()) || currentBatchNames.has(friendName.toLowerCase())) && attempts < 100);

    currentBatchNames.add(friendName.toLowerCase());

    let bio = "";
    let bioAttempts = 0;
    do {
      bio = `${getRandomItem(BIO_MOTIVES)} ${getRandomItem(BIO_BELIEFS)}`;
      bioAttempts++;
    } while (existingBios.has(bio.toLowerCase()) && bioAttempts < 50);

    const age = getRandomInt(18, 120);

    const shuffledInterests = [...INTEREST_TOPICS].sort(() => 0.5 - Math.random());
    const interests = shuffledInterests.slice(0, 3).join(", ");

    const encodedName = encodeURIComponent(friendName);
    const bgColor = AVATAR_BG_COLORS[(existingFriends.length + i) % AVATAR_BG_COLORS.length];
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&size=150&background=${bgColor}&color=ffffff&bold=true&font-size=0.45`;

    friends.push({
      id: "friend_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      name: friendName,
      avatarUrl: avatarUrl,
      age: age,
      bio: bio,
      interests: interests,
      createdAt: new Date().toISOString()
    });
  }

  return friends;
}

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
 * Create 5 strictly UNIQUE Friends at runtime using Replicate Proxy anthropic/claude-sonnet-5!
 */
export async function create5UserFriends(uid) {
  if (!uid) return { success: false, error: "No user ID provided" };

  const existingFriends = getLocalFriends(uid);

  // Call AI Runtime Generator using Replicate Proxy anthropic/claude-sonnet-5
  const new5Friends = await generate5FriendProfilesAI(existingFriends);
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

export function subscribeUserProfile(uid, callback) {
  if (!uid) return () => { };
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
    return () => { };
  }
}

export function subscribeUserFriends(uid, callback) {
  if (!uid) return () => { };
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
    return () => { };
  }
}

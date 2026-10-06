// app.js
import {
  loginUser,
  logoutUser,
  resetPassword,
  initAuthStateListener
} from "./auth.js";
import {
  generateDefaultProfile,
  getOrCreateUserProfile,
  updateUserProfile,
  subscribeUserProfile,
  create5UserFriends,
  getUserFriends,
  subscribeUserFriends
} from "./user-profile.js";

// Global App State
let currentUser = null;
let currentProfile = null;
let profileUnsubscribe = null;
let friendsUnsubscribe = null;
let userFriends = [];
let activeCategoryFilter = "all";
let userVaultItems = [];

// DOM Element Selectors
const elements = {
  // Views & Sections
  loginView: document.getElementById("login-view"),
  dashboardView: document.getElementById("dashboard-view"),
  userHeaderProfile: document.getElementById("user-header-profile"),

  // Header Elements
  headerUserEmail: document.getElementById("header-user-email"),
  headerUserAvatar: document.getElementById("header-user-avatar"),
  headerLogoutBtn: document.getElementById("header-logout-btn"),

  // Login Form Elements
  loginForm: document.getElementById("login-form"),
  loginEmail: document.getElementById("login-email"),
  loginPassword: document.getElementById("login-password"),
  rememberMeCheckbox: document.getElementById("remember-me-checkbox"),
  loginBtn: document.getElementById("login-btn"),
  togglePasswordBtn: document.getElementById("toggle-password-btn"),
  passwordToggleIcon: document.getElementById("password-toggle-icon"),
  forgotPasswordLink: document.getElementById("forgot-password-link"),

  // Dashboard Elements
  dashAvatar: document.getElementById("dash-avatar"),
  dashUserName: document.getElementById("dash-user-name"),
  dashUserEmail: document.getElementById("dash-user-email"),
  logoutBtn: document.getElementById("logout-btn"),
  addVaultItemBtn: document.getElementById("add-vault-item-btn"),

  // Realtime Database Profile Card Elements
  profileAvatarImg: document.getElementById("profile-avatar-img"),
  profileAgeBadge: document.getElementById("profile-age-badge"),
  profileNameText: document.getElementById("profile-name-text"),
  profileEmailSubtext: document.getElementById("profile-email-subtext"),
  profileBioText: document.getElementById("profile-bio-text"),
  profileInterestsTags: document.getElementById("profile-interests-tags"),
  openEditProfileBtn: document.getElementById("open-edit-profile-btn"),
  generateFriendsBtn: document.getElementById("generate-friends-btn"),
  friendsCountBadge: document.getElementById("friends-count-badge"),
  friendsListContainer: document.getElementById("friends-list-container"),

  // Welcome Profile Showcase Modal Elements
  welcomeProfileModal: document.getElementById("welcome-profile-modal"),
  welcomeAvatarImg: document.getElementById("welcome-avatar-img"),
  welcomeAgeBadge: document.getElementById("welcome-age-badge"),
  welcomeNameText: document.getElementById("welcome-name-text"),
  welcomeEmailText: document.getElementById("welcome-email-text"),
  welcomeBioText: document.getElementById("welcome-bio-text"),
  welcomeInterestsTags: document.getElementById("welcome-interests-tags"),
  closeWelcomeModalBtn: document.getElementById("close-welcome-modal-btn"),
  editFromWelcomeBtn: document.getElementById("edit-from-welcome-btn"),

  // Edit Profile Modal Elements
  editProfileModal: document.getElementById("edit-profile-modal"),
  closeEditProfileModalBtn: document.getElementById("close-edit-profile-modal-btn"),
  editProfileForm: document.getElementById("edit-profile-form"),
  editAvatarPreview: document.getElementById("edit-avatar-preview"),
  editAvatarUrl: document.getElementById("edit-avatar-url"),
  editName: document.getElementById("edit-name"),
  editAge: document.getElementById("edit-age"),
  editBio: document.getElementById("edit-bio"),
  bioWordCounter: document.getElementById("bio-word-counter"),
  editInterests: document.getElementById("edit-interests"),
  saveProfileBtn: document.getElementById("save-profile-btn"),

  // Vault List Elements
  vaultItemsList: document.getElementById("vault-items-list"),
  vaultCountBadge: document.getElementById("vault-count-badge"),
  vaultSearchInput: document.getElementById("vault-search-input"),
  filterTabs: document.querySelectorAll(".tab-btn"),

  // Generator Elements
  generatedPasswordText: document.getElementById("generated-password-text"),
  refreshGenBtn: document.getElementById("refresh-gen-btn"),
  copyGenBtn: document.getElementById("copy-gen-btn"),
  strengthBar: document.getElementById("strength-bar"),
  strengthText: document.getElementById("strength-text"),
  genLength: document.getElementById("gen-length"),
  genLengthVal: document.getElementById("gen-length-val"),
  genUppercase: document.getElementById("gen-uppercase"),
  genLowercase: document.getElementById("gen-lowercase"),
  genNumbers: document.getElementById("gen-numbers"),
  genSymbols: document.getElementById("gen-symbols"),

  // Firebase Profile Info Elements
  profileUid: document.getElementById("profile-uid"),
  copyUidBtn: document.getElementById("copy-uid-btn"),
  profileVerifiedBadge: document.getElementById("profile-verified-badge"),
  profileCreatedTime: document.getElementById("profile-created-time"),
  profileLastLogin: document.getElementById("profile-last-login"),
  triggerResetDashBtn: document.getElementById("trigger-reset-dash-btn"),

  // Reset Modal Elements
  resetModal: document.getElementById("reset-modal"),
  closeResetModalBtn: document.getElementById("close-reset-modal-btn"),
  resetForm: document.getElementById("reset-form"),
  resetEmail: document.getElementById("reset-email"),

  // Add Item Modal Elements
  addItemModal: document.getElementById("add-item-modal"),
  closeAddModalBtn: document.getElementById("close-add-modal-btn"),
  addItemForm: document.getElementById("add-item-form"),
  itemTitle: document.getElementById("item-title"),
  itemCategory: document.getElementById("item-category"),
  itemUsername: document.getElementById("item-username"),
  itemPassword: document.getElementById("item-password"),
  itemUrl: document.getElementById("item-url"),
  fillGeneratedBtn: document.getElementById("fill-generated-btn"),

  // Toast Container
  toastContainer: document.getElementById("toast-container")
};

// Default Sample Vault Credentials for new users
const DEFAULT_SAMPLE_ITEMS = [
  {
    id: "item_1",
    title: "Twitter / X Social Account",
    category: "Social",
    username: "social_lead@sharemind.app",
    password: "X#9kP2$mL9!vWq1s",
    url: "https://x.com"
  },
  {
    id: "item_2",
    title: "Company GitHub Organization",
    category: "Work",
    username: "dev-team@social-junk.com",
    password: "ghp_887aBv91kLqPzxM451",
    url: "https://github.com"
  },
  {
    id: "item_3",
    title: "Instagram Shared Brand Vault",
    category: "Social",
    username: "sharemind_official",
    password: "InstaP@ss2026_Secure!",
    url: "https://instagram.com"
  }
];

/* ==========================================================================
   Initialization & Auth Listener
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // Setup Event Listeners
  setupAuthEventListeners();
  setupProfileEventListeners();
  setupGeneratorEventListeners();
  setupVaultEventListeners();

  // Generate initial password for generator widget
  generatePassword();

  // Listen to Firebase Auth State Changes
  initAuthStateListener((user) => {
    if (user) {
      handleUserSignedIn(user);
    } else {
      handleUserSignedOut();
    }
  });
}

/* ==========================================================================
   Auth Handlers & View Controllers
   ========================================================================== */

async function handleUserSignedIn(user) {
  currentUser = user;

  // Extract user info
  const email = user.email || "User";
  const initial = email.charAt(0).toUpperCase();
  const userName = email.split('@')[0];

  // Update Header User Profile
  elements.headerUserEmail.textContent = email;
  elements.headerUserAvatar.textContent = initial;
  elements.userHeaderProfile.classList.remove("hidden");

  // Update Firebase Session Details
  elements.profileUid.textContent = user.uid;
  elements.profileVerifiedBadge.textContent = user.emailVerified ? "Verified" : "Unverified";
  elements.profileVerifiedBadge.className = `status-pill ${user.emailVerified ? "success" : "warning"}`;

  // Format creation & last login times
  const creationTime = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : 'Unknown';
  const lastLoginTime = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : 'Just now';

  elements.profileCreatedTime.textContent = creationTime;
  elements.profileLastLogin.textContent = lastLoginTime;

  // Toggle View Visibility
  elements.loginView.classList.add("hidden");
  elements.loginView.style.display = "none";
  elements.dashboardView.classList.remove("hidden");
  elements.dashboardView.style.display = "flex";

  // Load User Vault Items
  loadUserVault(user.uid);

  // 1. Synchronously render initial generated profile so profile displays IMMEDIATELY (0ms)
  const initialProfile = generateDefaultProfile(user);
  updateProfileUI(initialProfile);

  // Show Welcome Profile Showcase Modal on Login
  if (elements.welcomeProfileModal) {
    // elements.welcomeProfileModal.classList.remove("hidden");
    elements.dashboardView.classList.remove("hidden");
  }

  // 2. Asynchronously fetch/sync from Realtime Database or LocalStorage
  const profile = await getOrCreateUserProfile(user);
  if (profile) {
    updateProfileUI(profile);
  }

  // 3. Subscribe to Realtime Profile updates from RTDB
  if (profileUnsubscribe) profileUnsubscribe();
  profileUnsubscribe = subscribeUserProfile(user.uid, (updatedProfile) => {
    if (updatedProfile) {
      updateProfileUI(updatedProfile);
    }
  });

  // 4. Load & Subscribe to Social Friends List
  loadFriends(user.uid);
  if (friendsUnsubscribe) friendsUnsubscribe();
  friendsUnsubscribe = subscribeUserFriends(user.uid, (updatedFriends) => {
    if (updatedFriends) {
      renderFriendsUI(updatedFriends);
    }
  });

  showToast(`Welcome back, ${profile?.name || userName}!`, "success");
}

function handleUserSignedOut() {
  currentUser = null;
  currentProfile = null;
  userVaultItems = [];
  userFriends = [];

  if (profileUnsubscribe) {
    profileUnsubscribe();
    profileUnsubscribe = null;
  }

  if (friendsUnsubscribe) {
    friendsUnsubscribe();
    friendsUnsubscribe = null;
  }

  elements.userHeaderProfile.classList.add("hidden");
  elements.dashboardView.classList.add("hidden");
  elements.dashboardView.style.display = "none";
  elements.loginView.classList.remove("hidden");
  elements.loginView.style.display = "flex";
}


function setupAuthEventListeners() {
  // Login Form Submission
  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    const rememberMe = elements.rememberMeCheckbox.checked;

    if (!email || !password) {
      showToast("Please enter both email and password.", "error");
      return;
    }

    setLoadingState(elements.loginBtn, true);

    const result = await loginUser(email, password, rememberMe);
    setLoadingState(elements.loginBtn, false);

    if (!result.success) {
      showToast(result.error, "error");
    }
  });

  // Password Visibility Toggle
  elements.togglePasswordBtn.addEventListener("click", () => {
    const isPassword = elements.loginPassword.type === "password";
    elements.loginPassword.type = isPassword ? "text" : "password";
    elements.passwordToggleIcon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
  });

  // Logout Buttons
  elements.logoutBtn.addEventListener("click", performLogout);
  elements.headerLogoutBtn.addEventListener("click", performLogout);

  // Forgot Password Link & Modal
  elements.forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    elements.resetEmail.value = elements.loginEmail.value;
    elements.resetModal.classList.remove("hidden");
  });

  elements.closeResetModalBtn.addEventListener("click", () => {
    elements.resetModal.classList.add("hidden");
  });

  elements.resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = elements.resetEmail.value.trim();
    if (!email) {
      showToast("Please enter your account email.", "error");
      return;
    }

    const resetBtn = elements.resetForm.querySelector("button[type='submit']");
    setLoadingState(resetBtn, true);

    const result = await resetPassword(email);
    setLoadingState(resetBtn, false);

    if (result.success) {
      showToast(`Password reset link sent to ${email}`, "success");
      elements.resetModal.classList.add("hidden");
    } else {
      showToast(result.error, "error");
    }
  });

  // Trigger Reset Link from Dashboard Profile
  elements.triggerResetDashBtn.addEventListener("click", async () => {
    if (currentUser && currentUser.email) {
      setLoadingState(elements.triggerResetDashBtn, true);
      const result = await resetPassword(currentUser.email);
      setLoadingState(elements.triggerResetDashBtn, false);
      if (result.success) {
        showToast(`Reset email sent to ${currentUser.email}`, "success");
      } else {
        showToast(result.error, "error");
      }
    }
  });

  // Copy UID Button
  elements.copyUidBtn.addEventListener("click", () => {
    if (currentUser && currentUser.uid) {
      navigator.clipboard.writeText(currentUser.uid);
      showToast("Firebase UID copied to clipboard!", "info");
    }
  });
}

/* ==========================================================================
   Realtime Profile Controller & Event Listeners
   ========================================================================== */

function updateProfileUI(profile) {
  currentProfile = profile;
  if (!profile) return;

  // 150x150 avatar image
  if (elements.profileAvatarImg && profile.avatarUrl) {
    elements.profileAvatarImg.src = profile.avatarUrl;
  }

  // Age badge
  if (elements.profileAgeBadge) {
    elements.profileAgeBadge.textContent = `Age ${profile.age || 25}`;
  }

  // Full Name
  if (elements.profileNameText) {
    elements.profileNameText.textContent = profile.name || "Anonymous User";
  }

  if (elements.dashUserName) {
    elements.dashUserName.textContent = profile.name ? profile.name.split(' ')[0] : "User";
  }

  if (elements.dashUserEmail && profile.email) {
    elements.dashUserEmail.textContent = profile.email;
  }

  if (elements.profileEmailSubtext && profile.email) {
    elements.profileEmailSubtext.textContent = profile.email;
  }

  // Bio / Self description (< 100 words)
  if (elements.profileBioText) {
    elements.profileBioText.textContent = profile.bio || "No self description provided.";
  }

  // Interests group tags
  if (elements.profileInterestsTags && profile.interests) {
    const tags = profile.interests.split(',').map(item => item.trim()).filter(Boolean);
    elements.profileInterestsTags.innerHTML = tags.map(tag => `<span class="interest-tag">${escapeHtml(tag)}</span>`).join('');
  }

  // Populate Welcome Showcase Modal
  if (elements.welcomeAvatarImg && profile.avatarUrl) {
    elements.welcomeAvatarImg.src = profile.avatarUrl;
  }
  if (elements.welcomeAgeBadge) {
    elements.welcomeAgeBadge.textContent = `Age ${profile.age || 25}`;
  }
  if (elements.welcomeNameText) {
    elements.welcomeNameText.textContent = profile.name || "Anonymous User";
  }
  if (elements.welcomeEmailText && profile.email) {
    elements.welcomeEmailText.textContent = profile.email;
  }
  if (elements.welcomeBioText) {
    elements.welcomeBioText.textContent = profile.bio || "No self description provided.";
  }
  if (elements.welcomeInterestsTags && profile.interests) {
    const tags = profile.interests.split(',').map(item => item.trim()).filter(Boolean);
    elements.welcomeInterestsTags.innerHTML = tags.map(tag => `<span class="interest-tag">${escapeHtml(tag)}</span>`).join('');
  }
}

async function loadFriends(uid) {
  const friends = await getUserFriends(uid);
  renderFriendsUI(friends);
}

function renderFriendsUI(friends) {
  userFriends = friends || [];
  if (!elements.friendsListContainer) return;

  if (elements.friendsCountBadge) {
    elements.friendsCountBadge.textContent = `${userFriends.length} Friends`;
  }

  if (userFriends.length === 0) {
    elements.friendsListContainer.innerHTML = `
      <p class="empty-friends-text">No friends added yet. Click <strong>"Add 5 Friends"</strong> above!</p>
    `;
    return;
  }

  elements.friendsListContainer.innerHTML = userFriends.map(friend => {
    const tags = (friend.interests || "").split(',').map(item => item.trim()).filter(Boolean);
    const tagsHtml = tags.map(tag => `<span class="interest-tag">${escapeHtml(tag)}</span>`).join('');

    return `
      <div class="friend-item-card">
        <div class="friend-header-row">
          <div class="friend-avatar-150-wrapper">
            <img src="${escapeHtml(friend.avatarUrl)}" alt="${escapeHtml(friend.name)}" class="friend-avatar-150-img" width="70" height="70">
            <span class="friend-age-badge">Age ${friend.age}</span>
          </div>
          <div class="friend-meta-info">
            <h4>${escapeHtml(friend.name)}</h4>
            <p class="friend-bio-text">"${escapeHtml(friend.bio)}"</p>
          </div>
        </div>
        <div class="interests-tags-wrapper">
          ${tagsHtml}
        </div>
      </div>
    `;
  }).join('');
}

function setupProfileEventListeners() {
  // Generate 5 Friends Button Listener
  if (elements.generateFriendsBtn) {
    elements.generateFriendsBtn.addEventListener("click", async () => {
      if (!currentUser) return;
      setLoadingState(elements.generateFriendsBtn, true);

      const result = await create5UserFriends(currentUser.uid);
      setLoadingState(elements.generateFriendsBtn, false);

      if (result.success) {
        renderFriendsUI(result.friends);
        showToast("Generated 5 new social friends with complete profile fields!", "success");
      } else {
        showToast(`Failed to generate friends: ${result.error}`, "error");
      }
    });
  }

  // Close Welcome Showcase Modal
  if (elements.closeWelcomeModalBtn) {
    elements.closeWelcomeModalBtn.addEventListener("click", () => {
      elements.welcomeProfileModal.classList.add("hidden");
    });
  }

  if (elements.editFromWelcomeBtn) {
    elements.editFromWelcomeBtn.addEventListener("click", () => {
      elements.welcomeProfileModal.classList.add("hidden");
      if (!currentProfile) return;

      elements.editAvatarUrl.value = currentProfile.avatarUrl || "";
      elements.editAvatarPreview.src = currentProfile.avatarUrl || "";
      elements.editName.value = currentProfile.name || "";
      elements.editAge.value = currentProfile.age || 28;
      elements.editBio.value = currentProfile.bio || "";
      elements.editInterests.value = currentProfile.interests || "";

      updateBioWordCounter();
      elements.editProfileModal.classList.remove("hidden");
    });
  }

  // Open Edit Profile Modal
  elements.openEditProfileBtn.addEventListener("click", () => {
    if (!currentProfile) return;

    elements.editAvatarUrl.value = currentProfile.avatarUrl || "";
    elements.editAvatarPreview.src = currentProfile.avatarUrl || "";
    elements.editName.value = currentProfile.name || "";
    elements.editAge.value = currentProfile.age || 28;
    elements.editBio.value = currentProfile.bio || "";
    elements.editInterests.value = currentProfile.interests || "";

    updateBioWordCounter();
    elements.editProfileModal.classList.remove("hidden");
  });

  // Close Modal
  elements.closeEditProfileModalBtn.addEventListener("click", () => {
    elements.editProfileModal.classList.add("hidden");
  });

  // Live Avatar Preview
  elements.editAvatarUrl.addEventListener("input", (e) => {
    const url = e.target.value.trim();
    if (url) {
      elements.editAvatarPreview.src = url;
    }
  });

  // Word counter for Bio (< 100 words)
  elements.editBio.addEventListener("input", () => {
    updateBioWordCounter();
  });

  // Save Profile Form Submit
  elements.editProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const avatarUrl = elements.editAvatarUrl.value.trim();
    const name = elements.editName.value.trim();
    const age = parseInt(elements.editAge.value, 10);
    const bio = elements.editBio.value.trim();
    const interests = elements.editInterests.value.trim();

    if (!avatarUrl || !name || !age || !bio || !interests) {
      showToast("Please fill in all required profile fields.", "error");
      return;
    }

    if (age < 18 || age > 120) {
      showToast("Age must be between 18 and 120.", "error");
      return;
    }

    const wordCount = getWordCount(bio);
    if (wordCount > 100) {
      showToast("Self description must be less than 100 words.", "error");
      return;
    }

    setLoadingState(elements.saveProfileBtn, true);

    const updatedProfileObj = {
      ...currentProfile,
      avatarUrl,
      name,
      age,
      bio,
      interests,
      updatedAt: new Date().toISOString()
    };

    const result = await updateUserProfile(currentUser.uid, updatedProfileObj);
    setLoadingState(elements.saveProfileBtn, false);

    if (result.success) {
      updateProfileUI(updatedProfileObj);
      elements.editProfileModal.classList.add("hidden");

      if (result.warning) {
        showToast("Profile saved locally! (Enable RTDB rules in console to sync online)", "info");
      } else {
        showToast("Profile updated in Realtime Database!", "success");
      }
    } else {
      showToast(`Failed to update profile: ${result.error}`, "error");
    }
  });
}

function updateBioWordCounter() {
  const text = elements.editBio.value.trim();
  const wordCount = getWordCount(text);
  elements.bioWordCounter.textContent = `${wordCount} / 100 words`;
  if (wordCount > 100) {
    elements.bioWordCounter.classList.add("exceeded");
  } else {
    elements.bioWordCounter.classList.remove("exceeded");
  }
}

function getWordCount(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

async function performLogout() {

  const result = await logoutUser();
  if (result.success) {
    showToast("Signed out successfully.", "info");
  } else {
    showToast(result.error, "error");
  }
}

/* ==========================================================================
   Vault Management Logic
   ========================================================================== */

function loadUserVault(uid) {
  const storageKey = `sharemind_vault_${uid}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      userVaultItems = JSON.parse(stored);
    } catch {
      userVaultItems = DEFAULT_SAMPLE_ITEMS;
    }
  } else {
    // Seed with defaults for a clean demonstration
    userVaultItems = DEFAULT_SAMPLE_ITEMS;
    saveUserVault(uid);
  }

  renderVaultItems();
}

function saveUserVault(uid) {
  if (!uid) return;
  localStorage.setItem(`sharemind_vault_${uid}`, JSON.stringify(userVaultItems));
}

function renderVaultItems() {
  const query = elements.vaultSearchInput.value.toLowerCase().trim();

  const filtered = userVaultItems.filter(item => {
    const matchesCategory = activeCategoryFilter === "all" || item.category === activeCategoryFilter;
    const matchesQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      item.username.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  elements.vaultCountBadge.textContent = `${filtered.length} Items`;
  elements.vaultItemsList.innerHTML = "";

  if (filtered.length === 0) {
    elements.vaultItemsList.innerHTML = `
      <div class="empty-vault-state" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--text-dim);"></i>
        <p>No passwords found in this vault category.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const itemCard = document.createElement("div");
    itemCard.className = "vault-item-card";

    // Choose icon based on category or domain
    let iconClass = "fa-solid fa-key";
    if (item.category === "Social") iconClass = "fa-solid fa-share-nodes";
    if (item.category === "Work") iconClass = "fa-solid fa-briefcase";

    itemCard.innerHTML = `
      <div class="item-main">
        <div class="item-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="item-details">
          <h4>${escapeHtml(item.title)}</h4>
          <div class="item-username">
            <span>${escapeHtml(item.username)}</span>
            <span class="tag-pill">${escapeHtml(item.category)}</span>
          </div>
        </div>
      </div>

      <div class="item-secret-row">
        <span class="password-masked" id="pwd-mask-${item.id}">••••••••••••</span>
        <button class="btn-icon btn-sm toggle-item-pwd" data-id="${item.id}" title="Show / Hide Password">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="btn-icon btn-sm copy-item-pwd" data-id="${item.id}" title="Copy Password">
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
    `;

    elements.vaultItemsList.appendChild(itemCard);
  });

  // Attach dynamic event listeners for secret toggle & copy
  document.querySelectorAll(".toggle-item-pwd").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const item = userVaultItems.find(i => i.id === id);
      const maskEl = document.getElementById(`pwd-mask-${id}`);
      const iconEl = e.currentTarget.querySelector("i");

      if (maskEl.textContent === "••••••••••••") {
        maskEl.textContent = item.password;
        maskEl.style.color = "var(--text-main)";
        iconEl.className = "fa-solid fa-eye-slash";
      } else {
        maskEl.textContent = "••••••••••••";
        maskEl.style.color = "var(--text-muted)";
        iconEl.className = "fa-solid fa-eye";
      }
    });
  });

  document.querySelectorAll(".copy-item-pwd").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const item = userVaultItems.find(i => i.id === id);
      if (item) {
        navigator.clipboard.writeText(item.password);
        showToast(`Copied password for ${item.title}`, "success");
      }
    });
  });
}

function setupVaultEventListeners() {
  // Search Input Listener
  elements.vaultSearchInput.addEventListener("input", () => {
    renderVaultItems();
  });

  // Category Filter Tabs
  elements.filterTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      elements.filterTabs.forEach(t => t.classList.remove("active"));
      e.currentTarget.classList.add("active");
      activeCategoryFilter = e.currentTarget.getAttribute("data-filter");
      renderVaultItems();
    });
  });

  // Open Add Secret Modal
  elements.addVaultItemBtn.addEventListener("click", () => {
    elements.addItemModal.classList.remove("hidden");
  });

  elements.closeAddModalBtn.addEventListener("click", () => {
    elements.addItemModal.classList.add("hidden");
  });

  // Fill Generated Password into Add Modal
  elements.fillGeneratedBtn.addEventListener("click", () => {
    elements.itemPassword.value = elements.generatedPasswordText.textContent;
    showToast("Filled generated password!", "info");
  });

  // Add Item Form Submit
  elements.addItemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = elements.itemTitle.value.trim();
    const category = elements.itemCategory.value;
    const username = elements.itemUsername.value.trim();
    const password = elements.itemPassword.value;
    const url = elements.itemUrl.value.trim();

    if (!title || !username || !password) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const newItem = {
      id: "item_" + Date.now(),
      title,
      category,
      username,
      password,
      url
    };

    userVaultItems.unshift(newItem);
    if (currentUser) {
      saveUserVault(currentUser.uid);
    }
    renderVaultItems();

    elements.addItemModal.classList.add("hidden");
    elements.addItemForm.reset();
    showToast(`Added "${title}" to your vault!`, "success");
  });
}

/* ==========================================================================
   Password Generator Widget
   ========================================================================== */

function setupGeneratorEventListeners() {
  // Slider listener
  elements.genLength.addEventListener("input", (e) => {
    elements.genLengthVal.textContent = e.target.value;
    generatePassword();
  });

  // Checkbox listeners
  [elements.genUppercase, elements.genLowercase, elements.genNumbers, elements.genSymbols].forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      generatePassword();
    });
  });

  // Refresh Button
  elements.refreshGenBtn.addEventListener("click", () => {
    generatePassword();
  });

  // Copy Password Button
  elements.copyGenBtn.addEventListener("click", () => {
    const pwd = elements.generatedPasswordText.textContent;
    if (pwd && pwd !== "Generating...") {
      navigator.clipboard.writeText(pwd);
      showToast("Generated password copied to clipboard!", "success");
    }
  });
}

function generatePassword() {
  const length = parseInt(elements.genLength.value, 10);
  const includeUpper = elements.genUppercase.checked;
  const includeLower = elements.genLowercase.checked;
  const includeNumbers = elements.genNumbers.checked;
  const includeSymbols = elements.genSymbols.checked;

  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let charPool = "";
  let mandatoryChars = [];

  if (includeUpper) {
    charPool += upperChars;
    mandatoryChars.push(upperChars.charAt(Math.floor(Math.random() * upperChars.length)));
  }
  if (includeLower) {
    charPool += lowerChars;
    mandatoryChars.push(lowerChars.charAt(Math.floor(Math.random() * lowerChars.length)));
  }
  if (includeNumbers) {
    charPool += numberChars;
    mandatoryChars.push(numberChars.charAt(Math.floor(Math.random() * numberChars.length)));
  }
  if (includeSymbols) {
    charPool += symbolChars;
    mandatoryChars.push(symbolChars.charAt(Math.floor(Math.random() * symbolChars.length)));
  }

  if (charPool === "") {
    elements.generatedPasswordText.textContent = "Select at least 1 set";
    elements.strengthBar.style.width = "0%";
    elements.strengthText.textContent = "Invalid";
    return;
  }

  let generated = [...mandatoryChars];
  for (let i = mandatoryChars.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    generated.push(charPool.charAt(randomIndex));
  }

  // Shuffle generated array using Fisher-Yates
  for (let i = generated.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [generated[i], generated[j]] = [generated[j], generated[i]];
  }

  const finalPassword = generated.join("");
  elements.generatedPasswordText.textContent = finalPassword;

  // Calculate & Update Strength Meter
  updateStrengthMeter(finalPassword, length, charPool.length);
}

function updateStrengthMeter(password, length, poolSize) {
  const entropy = length * Math.log2(poolSize);
  let strengthPercentage = 0;
  let label = "Weak";
  let color = "var(--rose)";

  if (entropy < 35) {
    strengthPercentage = 25;
    label = "Weak";
    color = "var(--rose)";
  } else if (entropy < 60) {
    strengthPercentage = 55;
    label = "Fair";
    color = "var(--amber)";
  } else if (entropy < 80) {
    strengthPercentage = 80;
    label = "Good";
    color = "var(--sky)";
  } else {
    strengthPercentage = 100;
    label = "Strong";
    color = "var(--emerald)";
  }

  elements.strengthBar.style.width = `${strengthPercentage}%`;
  elements.strengthBar.style.backgroundColor = color;
  elements.strengthText.textContent = label;
  elements.strengthText.style.color = color;
}

/* ==========================================================================
   UI Helpers & Notification Toasts
   ========================================================================== */

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "fa-solid fa-circle-info";
  if (type === "success") icon = "fa-solid fa-circle-check";
  if (type === "error") icon = "fa-solid fa-triangle-exclamation";

  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function setLoadingState(buttonEl, isLoading) {
  if (!buttonEl) return;
  const btnText = buttonEl.querySelector(".btn-text");
  const btnArrow = buttonEl.querySelector(".btn-arrow");
  const spinner = buttonEl.querySelector(".spinner");

  if (isLoading) {
    buttonEl.disabled = true;
    if (btnText) btnText.style.opacity = "0.6";
    if (btnArrow) btnArrow.classList.add("hidden");
    if (spinner) spinner.classList.remove("hidden");
  } else {
    buttonEl.disabled = false;
    if (btnText) btnText.style.opacity = "1";
    if (btnArrow) btnArrow.classList.remove("hidden");
    if (spinner) spinner.classList.add("hidden");
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

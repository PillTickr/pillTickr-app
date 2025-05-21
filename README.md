src/
├── screens/
│   ├── SplashScreen.tsx
│   ├── SignInScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CreateReminderScreen.tsx
│   └── ProfileScreen.tsx
├── context/
│   └── AuthContext.tsx
├── storage/
│   ├── reminderStorage.ts
│   └── userStorage.ts
├── utils/
│   └── supabase.ts
└── App.tsx



## 📱 **PillTickr App Flow**

### 🧭 First-Time Launch

1. **Welcome Screen:**

   * Options:

     * **Continue as Guest** → ask for name
     * **Sign in with Email** (via NextAuth or Firebase)
     * **Sign in with Google**
2. **After login/guest entry** → navigate to **HomeScreen**

---

### 🏠 **Home Screen**

* Greeting message (e.g., “Hi \[User] 👋”)
* **FAB**: “+ Add Reminder”
* List of upcoming reminders
* Slide-out **Sidebar / Drawer Menu**:

  * Profile
  * Settings
  * Help / About
  * Sign out (if logged in)

---

### ➕ **Add Reminder Flow**

* Input:

  * Medicine Name
  * Dosage
  * One or more Time(s) per day (with DateTimePicker)
  * Optional: Notes
* Store reminder **locally**
* If sync is enabled and user is logged in → also upload to cloud

---

### 👤 **Profile / Settings**

* View and edit **display name**
* **Sync with Cloud** toggle (enabled only if user is signed in)
* If guest:

  * Show notice: “Create an account to enable sync”
* Sign in / Sign out button

---

### 💾 **Storage Strategy**

* Local: Use `AsyncStorage` or `SQLite` (for structured reminders)
* Cloud: Firebase Firestore or Supabase (optional sync)

  * Store reminders under user ID/email
  * Sync on app start + manual sync toggle

---

👀 Hoax detector is the AI based web app which will tell you if the information you are reading is just a Hoax.
☝️ Hax detector (AI + Firebase)

Modern, two-tab interface that lets users paste text or submit a URL for AI fact-checking via Gemini. Authenticated users can save and review detection history in Firestore. Built as a static, front-end–only app that you can host anywhere (Firebase Hosting, GitHub Pages, Netlify, etc.).

🌟Highlights
- 🔐 Firebase Auth (email/password) with modal UX
- 📝 Text or 🔗 URL analysis (URL auto-extraction via CORS proxy for dev)
- 🤖 Google Gemini content analysis
- 📜 User-specific history stored in Firestore (delete supported)
- 🎨 Responsive gradient UI with tabs + navbar

▶️Quick Start (5–10 minutes)
1) Clone / open the project.  
2) Create a Firebase project (console.firebase.google.com).  👀👀
3) Register a Web app (web `</>` icon) and copy the `firebaseConfig`.  
4) Enable Email/Password in Firebase → Authentication → Sign-in method.  
5) Enable Firestore (start in test mode for dev).  
6) Paste config into `firebase-config.js` (compat style already wired):  
   - Ensure `storageBucket` ends with `.appspot.com`.  
7) Run locally: open `index.html` or serve (`python -m http.server 8000`) and visit `http://localhost:8000`.  
8) Sign up and analyze text/URLs; check History page.

🤔 Firebase Config (compat SDK)
Update `firebase-config.js` with your project keys:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // optional
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```

## Firestore Security Rules (set before production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /detections/{doc} {
      // Owners only
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      // Allow create when userId matches requester
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

 🔁🏃‍♂️Running Locally
```bash
# Option A: Python
python -m http.server 8000
# Option B: Node
npx http-server
```
Then open `http://localhost:8000`.

## Usage Flow
1) Auth: Sign up/login (nav bar).  
2) Choose input: Text tab (paste) or URL tab (enter link).  
3) Analyze: Click “Check News” → Gemini returns classification, confidence, explanation.  
4) *History*: Authenticated users can view/delete past detections in `history.html`.  

^-^ The project structure is as given below
```
Hoax detector/
├── index.html          # Main UI (tabs, modals, analysis)
├── history.html        # User history view (Firestore)
├── script.js           # Auth, input handling, Gemini call, history save
├── firebase-config.js  # Firebase compat config (edit with your keys)
└── README.md
```

👩‍💻Tech Stack 
- <font color="purple">Frontend:</font> <font color="blue">HTML, CSS, JavaScript (vanilla)</font>
- <span style="color:green">Hosting</span><br>: <span style="color:pink">Any static host (Firebase Hosting, Netlify, GH Pages)</span><br>
- <span style="color:red">Backend-as-a-Service</span><br>:<span style="color:blue"> Firebase Auth + Firestore</span><br>
- <span style="color:pruple">AI</span><br>: <span style="color:pink">Google Gemini API (client-side call)</span><br>
- <span style="color:orange">URL extraction</span><br>:<span style="color:yellow"> AllOrigins CORS proxy (dev convenience)</span><br>        


 ☑️☑️Important Notes
- API keys: Gemini key is client-side; move to a backend for production to avoid leakage.  
- CORS proxy: AllOrigins is public; for production, build a small backend fetcher.  
- Rules: Firestore in test mode is not production-safe—apply rules above.  
- Buckets: Use `.appspot.com` bucket URLs for Firebase Storage.  
- Compat SDK: The app uses compat scripts loaded in HTML; keep `firebase-config.js` in compat style.

 ♦️Troubleshooting
- `auth is not defined`: Ensure `firebase-config.js` uses compat initialization (`firebase.initializeApp`) and runs after Firebase script tags.  
- `requests-to-this-api ... blocked`: You’re using the wrong key (e.g., Gemini key). Use the Firebase Web API key from Project Settings → General → Your apps (web).  
- URL analysis fails: Some sites block scraping/CORS. Paste text directly or use your own backend extractor.  

## Roadmap Ideas
- Backend URL extraction service (Node/Cloud Run)
- Move Gemini calls server-side with API key protection
- Export/share detections (PDF/CSV)
- Full-text search + filters in history
- Batch URL analysis and alerts/notifications

🌟 Credits
Built with Firebase + Google Gemini. Gradients inspired by modern dashboard UIs. Contributions and tweaks welcome! 🎉


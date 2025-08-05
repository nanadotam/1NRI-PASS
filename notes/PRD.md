Got it. You're building a **clean, aesthetic, data-collecting, pass-generating React app** that centers around:

* **Simplicity** ✅
* **Aesthetics for social media** ✅
* **Data capture & pass generation only** ✅
* **No scanner backend logic** – just visual confirmation when a QR is scanned ✅

Here's a **revised PRD** tailored to this new structure, followed by the **file structure and key UI behavior**, so you or an AI can build it seamlessly using React + Shadcn/UI.

---

## 📄 PRD: 1NRI Kairos Pass App (Frontend-Only)

### 🧠 Purpose:

To collect attendee data in the most beautiful, Gen Z, Instagrammable way possible — and generate a branded, downloadable **Kairos Pass** for every user.

---

### 🧩 App Features:

#### 1. **Homepage**

* Large 1NRI logo + “Kairos: A 1NRI Experience” heading
* Intro text: *“Join the Kairos experience. Get your personalized pass & step into divine alignment.”*
* One big **CTA Button**: `Get My Kairos Pass`

---

#### 2. **Form Page** (after clicking CTA)

* Fields to collect:

  * Full Name `Input`
  * Email Address `Input`
  * Phone Number `Input`
  * "How did you hear about Kairos?" `Dropdown`

    * Options:

      * Instagram
      * TikTok
      * Twitter/X
      * A Friend
      * I was in the area
      * I just knew ✨
* Submit button: `Generate My Pass`

---

#### 3. **Pass Generation Page**

* Auto-generates a **Kairos Pass as an image**:

  * Includes:

    * User Name
    * Randomized Kairos message (Gen Z vibe)
    * Randomized Bible verse (from the array you have)
    * QR Code (links to pass preview page)
    * Date + Pass ID
    * Color theme (green or dark purple)
* **CTA Button**: `Download Pass` (as PNG/JPG)
* **Optional toggle** to switch between `green` and `purple` themes (just styling, no logic now)

---

#### 4. **QR Code Redirect Page (Pass Preview Page)**

* Publicly accessible page rendered from the QR Code.
* URL format: `/pass/[passId]`
* Shows the exact same pass:

  * Name
  * Verse
  * Message
  * QR again (optional)
  * Date
* No login or scan logic. **It’s just a pretty preview.**

---

### ✅ NO FEATURES (By Intention):

* ❌ No database
* ❌ No login
* ❌ No backend
* ❌ No QR scanner built in — assume users will use built-in device scanners or 3rd party apps

---

## 🗂️ File Structure (React + Shadcn)

```
/1nri-kairos-pass
├── /public
│   └── /assets (logos, bg images)
├── /src
│   ├── /components
│   │   ├── Form.jsx
│   │   ├── PassCard.jsx
│   │   └── DownloadButton.jsx
│   ├── /pages
│   │   ├── index.jsx           # Homepage
│   │   ├── /form.jsx           # Data Collection
│   │   ├── /pass.jsx           # Pass generation
│   │   └── /pass/[id].jsx      # Preview page via QR
│   ├── /lib
│   │   └── verseGenerator.js
│   │   └── messageGenerator.js
│   └── App.jsx
├── tailwind.config.js
├── package.json
└── README.md
```

---

### 🖼️ UI Components Summary (Shadcn + Tailwind)

* `Button` – CTA
* `Input` – Text fields
* `Select` – Dropdown
* `Card` – For the pass layout
* `QRCode` – From `react-qr-code`
* `useTheme()` – Light/dark mode support
* `html2canvas` – For screenshot/download as image

---

## 🧪 Bonus: Logic Summary

### 1. 🎲 Message Generator (Gen Z Vibes)

```js
export const genZMessages = [
  "You didn’t just show up. You aligned. 🔥",
  "God knew. You came. It’s giving divine timing. ✨",
  "Chosen. Anointed. On time. 💼⏳",
  "This isn’t random. This is Kairos. 🕊",
  "You’re not late. You’re aligned. 💫",
  "Holy Spirit said, ‘pull up.’ You obeyed. 👣🔥",
  "Walking in purpose looks good on you. 💅🏾",
  "The vibe is spiritual. The moment is now. 🧿",
  "Kairos unlocked. You’re the key. 🗝️",
  "Heaven was waiting for you. 🫶🏾"
];
```

---


# OLD PRD
Perfect — you’ve got a solid direction and a clear visual identity. Let’s write a complete **Product Requirements Document (PRD)** for your **1NRI Kairos Ticketing App**, using **React + Shadcn/UI + QRCode + Camera access**, along with suggestions for additional software engineering documentation (like **use case** and **sequence diagrams**) to help you flesh it out further.

---

## 🧾 Product Requirements Document (PRD)

### 📌 Product Name:

**1NRI Kairos Ticketing System**

---

### ✨ Vision:

To create a **premium, seamless, and data-driven event check-in experience** for Kairos attendees, combining custom QR-coded tickets, real-time form capture, identity verification via mobile scans, and spiritual personalization — all wrapped in the 1NRI brand.

---

### 🎯 Goals:

* Digitally generate customized Kairos passes with user info, QR codes, and personalized verses.
* Collect event attendee data (name, phone, email, how they heard about the event).
* Verify form completion via **camera-based QR scanner**.
* Ensure sleek UX with **dark/light mode support** using Shadcn/UI.

---

### 🛠️ Tech Stack:

* **Frontend**: React (Next.js optional), TailwindCSS, Shadcn/UI
* **QR Code**: `qrcode.react` or `react-qr-code`
* **Camera Scanner**: `react-qr-scanner` or `html5-qrcode`
* **State/Data**: React Context or Redux (for data persistence)
* **Hosting**: Vercel or Netlify
* **Optional DB**: Supabase or Firebase (for storing user form data)
* **Optional Auth**: Clerk/Auth.js if access control is needed

---

### 🧩 Core Components:

#### 1. 🏠 **Home / Landing Page**

* CTA: “Get Your Kairos Pass”
* Brief explanation of the event
* Button to start the form

---

#### 2. 📄 **User Form Page**

* Shadcn Form using components:

  * `Input` for Full Name, Phone, Email
  * `Select` for “How did you hear about Kairos?”
  * `Button` to Submit
* On submit:

  * Generate QR Code pass with user data
  * Save info to Supabase (optional)

---

#### 3. 🎟️ **Generated Ticket Page**

* Displays:

  * QR Code (linked to unique pass ID or entry)
  * Name
  * Event title: "Kairos: A 1NRI Experience"
  * Funky Gen Z affirmation (randomized)
  * Personalized Bible verse (from array)
  * Date and Pass ID
* Shadcn components:

  * `Card`, `Text`, `Badge`, `Separator`
* Auto light/dark mode enabled via `ThemeProvider`

---

#### 4. 📷 **QR Scanner Page (Admin View)**

* Accesses device camera
* Scans guest’s QR code on entry
* On successful scan:

  * Verifies pass ID or fetches info from database
  * Displays “✔️ Valid Entry” with guest name
  * (Optional) Adds timestamp to mark attendance

---

#### 5. ⚙️ **Admin Dashboard (Optional)**

* View list of all submitted attendee info
* Filter by time, source, etc.
* Export CSV for analysis

---

### 🔄 Data Flow:

1. Guest submits form → Form data saved (local or Supabase)
2. Ticket is generated with embedded QR (linked to pass ID)
3. On entry, admin scans QR → checks database or stored values
4. Validated → Attendee granted access

---

## 🧠 Documentation Tools to Flesh This Out

To build this out fully in a **Software Engineering context**, use these:

---

### 1. ✅ **Use Case Diagram**

Shows who is using the system (Guest, Admin) and what they can do.

**Actors**:

* Guest
* Event Staff/Admin

**Use Cases**:

* Fill Form
* Generate Ticket
* Scan QR Code
* Verify Attendee
* View Attendance Logs (Admin only)

---

### 2. 🔁 **Sequence Diagram**

Shows step-by-step interaction between components.

**Example**:

```
Guest → Form → Backend (store data)
Guest ← Ticket (QR + Info)
Admin → Camera Scanner → QR Reader
QR Reader → Backend (verify ID)
Backend → Admin (return status: valid/invalid)
```

---

### 3. 🧱 **Component Architecture**

Breaks down each React component and its responsibility:

* `<Form />` – collects user input
* `<Ticket />` – renders QR + visual pass
* `<QRScanner />` – handles camera & scan
* `<VerseGenerator />` – provides random Bible verse
* `<MessageGenerator />` – rotates through Gen Z messages

---

### 4. 🧪 **Test Plan**

* Validate form inputs
* Test QR generation accuracy
* Ensure QR scanning works across devices
* Dark/light mode test
* Performance under heavy usage

---
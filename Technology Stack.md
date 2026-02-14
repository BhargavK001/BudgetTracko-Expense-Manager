# Technology Stack

## Overview
BudgetTracko is built using the **MERN stack** (MongoDB, Express, React, Node.js) with Firebase Authentication and AWS hosting, supporting both web and mobile platforms.

---

## Frontend Technologies

### Web Application
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: Redux / Context API
- **Routing**: React Router (`react-router-dom`)
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Charts & Visualization**: Chart.js / Recharts
- **Date Handling**: date-fns, react-datepicker

### Mobile Application
- **Framework**: React Native
- **Development Platform**: Expo
- **Navigation**: React Navigation (`@react-navigation/native`, `@react-navigation/bottom-tabs`)
- **Build System**: Expo EAS Build (for APK generation)
- **Storage**: AsyncStorage (`@react-native-async-storage/async-storage`)
- **Image Picker**: Expo Image Picker
- **Notifications**: Expo Notifications
- **Charts**: React Native Chart Kit

---

## Backend Technologies

### Runtime & Framework
- **Runtime**: Node.js
- **Framework**: Express.js
- **Environment Variables**: dotenv

### Database
- **Database**: MongoDB
- **ODM**: Mongoose

### Authentication & Security
- **Authentication**: Firebase Authentication
- **JWT**: JSON Web Tokens (`jsonwebtoken`)
- **OAuth**: Passport.js (Google OAuth)
- **Password Hashing**: bcrypt / bcryptjs
- **Security Middleware**: 
  - Helmet (HTTP headers)
  - CORS (Cross-Origin Resource Sharing)
  - Rate Limiting

---

## Storage & File Management

- **Cloud Storage**: Cloudinary (for images and attachments)
- **File Uploads**: Multer

---

## Hosting & Deployment

- **Web Frontend**: Vercel
- **Backend API**: AWS (Amazon Web Services)
- **Mobile Build**: Expo EAS Build (APK for Android)

---

## Additional Libraries & Tools

### Data Processing
- **CSV**: csv-parser (for backup/restore functionality)

### Development Tools
- **Package Manager**: npm / yarn
- **Version Control**: Git

---

## Architecture Summary

```
┌─────────────────────────────────────────────────┐
│           Frontend Layer                        │
├─────────────────────────────────────────────────┤
│  Web (React + Tailwind)  │  Mobile (React Native) │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│           Backend API (Node.js + Express)       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│           Database (MongoDB + Mongoose)         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  External Services                               │
│  • Firebase (Authentication)                    │
│  • Cloudinary (File Storage)                    │
│  • AWS (Hosting)                                │
└─────────────────────────────────────────────────┘
```

---

## Key Features Enabled by Stack

- ✅ **Cross-platform Development**: React for web, React Native for mobile
- ✅ **Real-time Data**: MongoDB for flexible data structure
- ✅ **Secure Authentication**: Firebase Auth + JWT tokens
- ✅ **Scalable Backend**: Express.js RESTful API
- ✅ **Modern UI**: Tailwind CSS for responsive design
- ✅ **Cloud Storage**: Cloudinary for media management
- ✅ **Production Ready**: Vercel + AWS deployment

---

## Stack Acronym

**MERN + Firebase + AWS**
- **M**ongoDB (Database)
- **E**xpress.js (Backend Framework)
- **R**eact (Frontend Framework)
- **N**ode.js (Runtime)
- **Firebase** (Authentication)
- **AWS** (Backend Hosting)

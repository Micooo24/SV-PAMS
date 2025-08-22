# SV-PAMS: Street Vendor Permit and AI-powered Monitoring System

## Overview

SV-PAMS (Street Vendor Permit and AI-powered Monitoring System) is a digital solution designed to streamline the process of issuing permits to street vendors and monitoring compliance through AI-powered analysis.  
The system provides a centralized platform accessible via web and mobile applications, offering government agencies a more efficient, transparent, and data-driven approach to vendor management and urban order enforcement.

---

## Features

- Vendor permit application and management
- AI-powered monitoring for vendor compliance
- Web dashboard for administrators
- Mobile application for on-the-ground monitoring
- Secure login and role-based access control
- Real-time synchronization between web, mobile, and backend services

---

## Tech Stack

- **Backend:** Python (FastAPI), Uvicorn  
- **Frontend (Web):** React with Vite  
- **Mobile Application:** React Native (Expo)  
- **Database:** MongoDB (configurable with other databases)  
- **Runtime Environment:** Node.js and Python 3.10+  

---

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.10+
- pip (Python package manager)
- Virtual environment (venv) for backend
- Git



### Frontend (Web Application)
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

### Backend (API Server)

```bash
cd backend

# Create virtual environment (only first time)
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI with Uvicorn
uvicorn server:app --reload

# Alternative entry point
python server.py
```

---

### Mobile Application

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

---


### Shortcuts (Terminal)

```bash
# Mobile
.\mobile

#Frontend
.\frontend

#Backend
.\backend.ps1
```
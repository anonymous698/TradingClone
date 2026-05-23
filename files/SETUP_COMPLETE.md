# Cryptex Setup Complete - Next Steps

## Backend Setup ✓ DONE
- [x] Python virtual environment created
- [x] Django dependencies installed
- [x] Database migrations applied
- [x] Demo accounts created

**Credentials:**
- **Admin**: `admin` / `admin1234` (Django admin at http://localhost:8000/admin)
- **Demo User**: `demo` / `demo1234` (starts with $100,000 USD)

## Frontend Setup - REQUIRES NODE.JS

Node.js is NOT installed on your system. You must install it first:

### Option 1: Direct Download (Recommended)
1. Go to https://nodejs.org
2. Download **LTS version** (Long Term Support)
3. Run the installer and follow prompts
4. **Restart your terminal/PowerShell** after installation
5. Verify: `node --version` and `npm --version`

### Option 2: Using Chocolatey
```powershell
choco install nodejs
```
Then restart your terminal.

### Option 3: Using Windows Package Manager
```powershell
winget install OpenJS.NodeJS
```
Then restart your terminal.

---

## After Installing Node.js

### Option A: Using Startup Script (Easiest)
```bash
cd files\cryptex
.\start.sh
```

### Option B: Manual Startup

**Terminal 1 - Django Backend:**
```bash
cd files\cryptex\backend
.\venv\Scripts\python manage.py runserver 8000
```

**Terminal 2 - React Frontend:**
```bash
cd files\cryptex\frontend
npm install
npm run dev
```

---

## Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

Use demo credentials (`demo` / `demo1234`) to log in.

---

## Troubleshooting

**Frontend build issues:**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

**CORS errors:**
- Ensure backend is running on port 8000
- Ensure frontend is running on port 5173

**Port conflicts:**
- Backend: `python manage.py runserver 8001` (change port)
- Frontend: `npm run dev -- --port 5174` (change port)

---

## Backend Commands

Activate virtual environment:
```bash
cd backend
.\venv\Scripts\activate
```

Run migrations:
```bash
python manage.py migrate
```

Create new migrations:
```bash
python manage.py makemigrations
```

Django shell:
```bash
python manage.py shell
```

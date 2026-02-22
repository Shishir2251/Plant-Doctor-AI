# 🌿 Plant Doctor AI — Plant Disease Detection System

A full-stack AI-powered plant health analysis system. Upload a photo or video frame of your plant and get instant diagnosis, explanation, and treatment advice — all for **free**.

---

## 🧠 How It Works

1. User uploads a photo or video of their plant
2. The image is sent to **Google Gemini Vision API** (free tier)
3. Gemini analyses the plant and returns:
   - ✅ Healthy or ❌ Problem detected
   - 🔍 Why the problem was detected (visual evidence)
   - 💊 Step-by-step solution/treatment
4. Results are displayed in a beautiful, intuitive dashboard

---

## 🏗️ Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React + Vite + TailwindCSS    |
| Backend   | FastAPI (Python)              |
| AI Model  | Google Gemini 1.5 Flash (FREE)|
| Storage   | Local disk (uploads folder)   |

---

## 📋 Prerequisites

- Node.js >= 18
- Python >= 3.10
- A **free** Google Gemini API key: https://aistudio.google.com/app/apikey

---

## 🚀 Quick Start

### 1. Clone the project

```bash
git clone <your-repo-url>
cd plant-doctor
```

### 2. Set up Backend

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Copy the environment file and add your API key:

```bash
cp .env.example .env
# Open .env and paste your Gemini API key
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend will run at: `http://localhost:8000`

### 3. Set up Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🔑 Getting Your Free Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and paste it in `backend/.env` as `GEMINI_API_KEY=your_key_here`

**Free tier limits**: 15 requests/minute, 1 million tokens/day — plenty for a demo!

---

## 📁 Project Structure

```
plant-doctor/
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── routes/
│       │   └── analysis.py
│       ├── services/
│       │   └── gemini_service.py
│       └── models/
│           └── schemas.py
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── UploadZone.jsx
        │   ├── ResultCard.jsx
        │   ├── LoadingPlant.jsx
        │   └── HistoryPanel.jsx
        ├── pages/
        │   └── Home.jsx
        ├── hooks/
        │   └── useAnalysis.js
        └── utils/
            └── api.js
```

---

## 🌐 API Endpoints

| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| POST   | `/api/analyse/image` | Analyse a plant image          |
| POST   | `/api/analyse/video` | Analyse a video (extracts frames) |
| GET    | `/api/health`        | Health check                   |

---

## 🔒 Environment Variables

### Backend (`backend/.env`)

| Variable        | Description                  | Required |
|-----------------|------------------------------|----------|
| `GEMINI_API_KEY`| Your Google Gemini API key   | ✅ Yes   |
| `MAX_FILE_SIZE` | Max upload size in MB        | No (default: 20) |
| `UPLOAD_DIR`    | Upload folder path           | No (default: uploads/) |

### Frontend (`frontend/.env`)

| Variable            | Description           |
|---------------------|-----------------------|
| `VITE_API_BASE_URL` | Backend API base URL  |

---

## 🐛 Troubleshooting

**CORS Error**: Make sure both frontend and backend are running. Check that `VITE_API_BASE_URL` in frontend `.env` matches your backend URL.

**API Key Error**: Ensure your Gemini API key is valid and pasted correctly in `backend/.env`.

**File too large**: Videos are limited to 20MB. For longer videos, upload a screenshot of the plant instead.

---

## 📈 Future Upgrades (Paid Version)

- Replace Gemini with a fine-tuned plant disease model
- Add disease history tracking with a database
- Mobile app (React Native)
- Multi-language support
- Expert botanist consultation integration

---

## 📄 License

MIT — free to use, modify, and distribute.
🚀 RealtyIQ – AI-Powered Real Estate Analysis Chatbot

RealtyIQ is a full-stack AI chatbot that analyzes Excel-based real estate datasets and returns:

📊 Dynamic charts

📝 AI-generated summaries using Gemini

📋 Filtered tables

🧠 Smart column detection

🔍 Natural-language query support

🏙️ Multi-area comparison

Built using React + Tailwind (frontend) and Django REST Framework + Pandas + Gemini API (backend).

⭐ Features
🔹 1. Upload Excel Data

Supports .xls and .xlsx

File stored server-side

Validated and parsed using Pandas

🔹 2. Natural Language Querying

Ask questions like:

“Show me weighted rate trends for Wakad in the last 3 years”

“Compare Hinjewadi and Baner for sold units”

“Give insights for all areas for carpet area supply”

🔹 3. AI-Generated Summaries (Gemini 2.5 Flash)

Backend uses:

client = genai.Client()


Generates:

3–4 bullet insights

Simple, easy-to-read language

Uses real data from uploaded Excel

🔹 4. Trend Charts

Frontend auto-renders:

Single-area line charts

Multi-area comparisons

Year-wise metric trends

🔹 5. Typing Indicator + Toast Notifications

Smooth UX with:

“Analyzing data…” bot typing animation

Toastify alerts for Excel upload success

🔹 6. Smart Column Detection

Finds correct metric column based on:

Keywords

Area type (flat/shop/office)

Numeric fallback rules

🛠️ Tech Stack
Frontend

React (Vite)

TailwindCSS

React-Toastify

Custom chart + table components

Backend

Django REST Framework

Pandas

Google Gemini API (google-genai)

Regex-based query interpretation

📁 Project Structure
RealtyIQ/
│
├── backend/
│   ├── api/
│   │   ├── views.py        # Core logic (AI, filtering, parsing)
│   │   ├── urls.py
│   ├── realty_backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   ├── manage.py
│   ├── .env                # GEMINI_API_KEY here
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── MessageArea.jsx
    │   │   ├── SummaryCard.jsx
    │   │   ├── ChartCard.jsx
    │   │   ├── TableCard.jsx
    │   │   ├── InputBar.jsx
    │   │   ├── ChatContainer.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    ├── .env (VITE_BACKEND_URL)

⚙️ Installation & Setup
1. Clone Repository
git clone https://github.com/annshkumarsingh/RealtyIQ
cd RealtyIQ

2. Backend Setup (Django)
Create & activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

Install requirements
pip install -r requirements.txt

Create .env
GEMINI_API_KEY=your_api_key_here

Run backend
python manage.py runserver

3. Frontend Setup (React)
cd frontend
npm install

Create .env file
VITE_BACKEND_URL=http://localhost:8000

Run frontend
npm run dev

🔌 API Endpoints
POST /api/upload_excel/

Uploads Excel file.

Request

multipart/form-data

file: <excel_file>

Response
{
  "message": "File uploaded and saved successfully",
  "rows": 124,
  "columns": ["area", "year", "flat - weighted average rate", ...]
}

POST /api/analyze/

Processes natural language query.

Request
{
  "query": "Compare Wakad and Baner for weighted rate last 3 years"
}

Response (example)
{
  "summary": "- Wakad saw price growth...\n- Baner peaked in 2022...",
  "metric": "flat - weighted average rate",
  "areas": ["Wakad", "Baner"],
  "comparison": {
    "Wakad": [...],
    "Baner": [...]
  },
  "table": [...]
}

🧠 Core Logic (Backend)
✔ Automatic Area Detection

Matches query to area column values using regex.

✔ N-Years Filter

Handles:

"last 3 years"

"2019–2023"

"2018-20"

"first 2 years"

✔ Column Detection

Understands:

weighted rate

prevailing range

sold units
…and more.

✔ AI Summary Generation

Uses Gemini 2.5 Flash to convert raw numbers into bullet insights.

🔮 Future Improvements

Chat history persistence

Geo-visualization

Trend prediction using ML

Excel schema validation

File delete/reset API endpoint

🙌 Author

Annsh Kumar Singh
Full-stack developer • AI enthusiast

GitHub: https://github.com/annshkumarsingh

Project Repo: https://github.com/annshkumarsingh/RealtyIQ
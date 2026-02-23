# 📊 SAVRA Admin Dashboard

A full-stack, responsive analytics dashboard designed to monitor and visualize faculty academic content generation (lessons, quizzes, and assessments). 

## 🚀 Tech Stack

* **Frontend:** React.js, Tailwind CSS, Recharts (Data Visualization), Axios
* **Backend:** Python, Flask, Flask-PyMongo, Flask-CORS
* **Database:** MongoDB
* **Deployment:** Netlify (Frontend) / Render (Backend) / MongoDB Atlas (Database)

## ✨ Features

* **High-Level Overview:** School-wide KPI tracking for total teachers, lessons, quizzes, and assessments.
* **Weekly Trend Analysis:** Interactive area charts visualizing content creation over time.
* **Deep-Dive Teacher Analytics:** Filterable views by teacher and grade level.
* **Activity Log:** Detailed, chronological table of every piece of content created.
* **Modular UI:** Built with DRY principles using reusable React components (e.g., `KpiCard`).

---

## 🏗 Architecture Decisions



1.  **Decoupled Client-Server Model:** The frontend (React) and backend (Flask) are completely separated. They communicate exclusively via a RESTful API. This allows either side to be swapped out, updated, or scaled independently.
2.  **Utility-First CSS (Tailwind):** Chosen over traditional CSS/SCSS files to keep styling scoped to components, reducing the overall CSS payload and accelerating UI development.
3.  **Client-Side Charting (Recharts):** Data visualizations are rendered on the client rather than generating static images on the server. This provides interactive tooltips and responsive resizing with minimal server overhead.
4.  **Component Modularization:** Repeated UI elements (like KPI metrics) were abstracted into reusable functional components (`<KpiCard />`). This reduces code duplication and makes global UI updates instantaneous.
5.  **Environment Variables:** Configured global Axios instances using `.env` variables to ensure smooth transitions between local development (`localhost`) and production deployments without hardcoding URLs.

---

## 📈 Future Scalability Improvements

As the school’s data grows, the following architectural upgrades should be implemented:

### Database & Backend Optimization
* **Database Indexing:** Add compound indexes in MongoDB on `Created_at`, `Grade`, and `Activity_type` to speed up query execution times as the collection size scales into the millions.
* **MongoDB Aggregation Pipelines:** Currently, some data formatting happens in Python. Shifting calculations (like grouping by week or counting totals) directly into MongoDB Aggregation Pipelines will significantly reduce the memory footprint on the Flask server.
* **API Caching (Redis):** Dashboard data is read-heavy and doesn't require real-time millisecond accuracy. Implementing a caching layer (like Redis) for the `/summary` and `/weekly` endpoints would drastically reduce database hits.

### Frontend Enhancements
* **Pagination / Virtualization:** The "Activity Log" table currently renders all filtered records. For teachers with thousands of records, implementing pagination or window virtualization (e.g., `react-window`) will keep the DOM lightweight and maintain 60fps scrolling.
* **Global State Management:** If more pages and complex filters are added, migrating from prop-drilling to a lightweight state manager like Zustand or the React Context API will keep the component tree clean.

---

## 💻 Local Setup Instructions

### Prerequisites
* Node.js (v16+)
* Python (3.8+)
* MongoDB running locally on port 27017

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py


### 1. Frontend Setup
cd frontend
npm install
# Create a .env file with VITE_API_URL=[http://127.0.0.1:5000](http://127.0.0.1:5000)
npm run dev


# DeployTrail

**DeployTrail** is a lightweight DevOps dashboard that tracks application deployments by app, environment, version, and time. It consists of a FastAPI backend and a Vite + React frontend styled with Tailwind CSS, optimized for development in Docker.

---

## 🚀 Features
- View the latest deployed version for each app across environments
- Highlight mismatched versions
- Click to view full deployment history per app
- Delete individual deployment entries
- Fast live-reload development workflow with Tailwind styling

---

## 🧰 Stack
- **Backend:** Python 3.11 + FastAPI + SQLModel + SQLite
- **Frontend:** React + Vite + Axios + Tailwind CSS
- **Containerized:** Docker + Docker Compose

---

## 🛠️ Getting Started (Development Mode)

1. **Clone the repository**
   ```bash
   git clone git@github.com:mosonyi/deploytrail.git
   cd deploytrail
   ```

2. **Configure API URL for the frontend**
   Create a file at `./frontend/config.json` with the following content:
   ```json
   {
     "API_URL": "http://localhost:8080"
   }
   ```

3. **Start the services**
   ```bash
   docker compose up --build
   ```

4. **Open the app**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:8080/docs](http://localhost:8080/docs) (Swagger UI)

---

## 📦 API Endpoints
- `GET /deployments`: List all deployments
- `POST /deployments`: Add a deployment
- `DELETE /deployments/{id}`: Delete a deployment by ID

**Sample payload:**
```json
{
  "app": "my-service",
  "environment": "production",
  "version": "v1.2.4",
  "note": "Deployed after hotfix"
}
```

---

## 📁 Folder Structure
```
.
├── api/              # FastAPI backend
│   ├── main.py       # Main app file
│   └── ...
├── frontend/         # React + Vite + Tailwind frontend
│   ├── main.jsx
│   ├── config.json   # API URL config
│   └── ...
├── docker-compose.yaml
└── README.md
```

---

## ✅ To Do (Suggestions)
- Add user authentication
- Add environment/version filters
- Export to CSV or Excel
- Production Dockerfile for frontend + NGINX

---

## 📄 License
This project is **free to use for everyone**. No license restrictions.

# AI Vision Novel Platform - Backend

FastAPI backend for the collaborative novel writing platform.

## Features

- User authentication (JWT)
- Novel CRUD operations
- Chapter management with Fork support
- Merge request workflow
- RESTful API design

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. API documentation will be available at:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get access token

### Novels
- `GET /api/novels` - List all novels
- `POST /api/novels` - Create novel (requires auth)
- `GET /api/novels/{id}` - Get novel details
- `PUT /api/novels/{id}` - Update novel (author only)
- `DELETE /api/novels/{id}` - Delete novel (author only)

### Chapters
- `GET /api/novels/{id}/chapters` - List all chapters
- `GET /api/novels/{id}/chapters/main` - List main storyline chapters
- `POST /api/novels/{id}/chapters` - Create chapter
- `GET /api/chapters/{id}` - Get chapter details
- `PUT /api/chapters/{id}` - Update chapter (author only)
- `DELETE /api/chapters/{id}` - Delete chapter (author only)
- `POST /api/chapters/{id}/fork` - Fork a chapter

### Merge Requests
- `GET /api/novels/{id}/merge-requests` - List merge requests
- `POST /api/novels/{id}/merge-requests` - Create merge request
- `PUT /api/merge-requests/{id}/approve` - Approve merge (novel author only)
- `PUT /api/merge-requests/{id}/reject` - Reject merge (novel author only)

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

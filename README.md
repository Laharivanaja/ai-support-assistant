# AI Support Assistant

A full-stack support assistant that provides answers based on specific documentation, featuring persistent chat history and session management.

## 🚀 Features
* **Persistent Chat**: Conversations are saved in a SQLite database.
* **Session Management**: Users can start new chats or revisit previous ones via a sidebar.
* **Strict Knowledge Rule**: The assistant only answers based on the provided `docs.json`.
* **Dual-Mode Backend**: Uses Google Gemini AI with a local keyword-search fallback for maximum reliability.
* **Rate Limiting**: Protects the server from spam (max 5 requests per minute).

## 🛠️ Tech Stack
* **Frontend**: React.js, Axios, CSS3
* **Backend**: Node.js, Express.js
* **Database**: SQLite3
* **AI**: Google Generative AI (Gemini 1.5 Flash)

## 📁 Database Schema
The project uses two relational tables:
* **sessions**: Stores unique `id` and `updated_at` timestamps.
* **messages**: Stores `session_id`, `role` (user/assistant), `content`, and `created_at`.

## ⚙️ Setup Instructions

### 1. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and add:
   ```env
   GEMINI_API_KEY=your_key_here
   PORT=5000
Start the server: node server.js

2. Frontend Setup
Navigate to the frontend folder: cd frontend

Install dependencies: npm install

Start the app: npm run dev

📋 Usage
To test the AI: Ask about "Refunds" or "Passwords".

To test the "Strict Rule": Ask something not in the docs.

To test history: Refresh the page or use the sidebar.

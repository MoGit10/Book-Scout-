## Developer Manual

### Audience
This section is intended for developers who will take over or continue 
development of the Book Scout project. Readers are expected to have general 
knowledge of web development concepts such as JavaScript, REST APIs, and basic 
backend services, but no prior familiarity with this codebase.

### Tech Stack
- Frontend: HTML, CSS, JavaScript (vanilla)
- Backend: Vercel Serverless Functions (Node.js) in `/api`
- External API: Open Library API (book discovery data)
- Database: Supabase (stores saved books)

### Project Structure
- `index.html`  
  Main UI for searching and browsing books
- `app.js`  
  Frontend logic (fetching Open Library data, rendering results, calling backend endpoints)
- `style.css`  
  Styling
- `api/`  
  Serverless backend endpoints
  - `save-book.js` saves a book into Supabase
  - `saved-books.js` returns saved books from Supabase
- `docs/`  
  Developer documentation (this manual)

### Installation and Dependencies
1. Clone the repo:
   ```bash
   git clone <YOUR_REPO_URL>
   cd Book-Scout-

### Server API Endpoints
Base path (production):
`https://book-scout-rho.vercel.app/api`

Both endpoints use Supabase with a Service Role key on the server side.

Required environment variables (Vercel + local):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

#### POST `/api/save-book`
Saves a book into the `saved_books` table in Supabase.

CORS:
- Allows `POST, OPTIONS`
- Allows `Content-Type`
- Allows all origins (`*`)

Request body (JSON):
```json
{
  "work_id": "OL123W",
  "title": "Example Book",
  "author": "Example Author",
  "cover_url": "https://covers.openlibrary.org/b/id/12345-M.jpg"
}

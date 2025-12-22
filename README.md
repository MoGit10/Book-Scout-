# Book Scout

Book Scout is a web application that helps users discover books by subject
using the Open Library API and save selected books to a personal collection.
The application focuses on subject-based discovery rather than guessing titles,
and demonstrates full-stack development using a serverless backend.

## Target Browsers
- Chrome (desktop)
- Firefox (desktop)
- Safari (desktop)
Mobile browsers are not officially supported.

## Documentation
- [Developer Manual](docs/README.md)

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
  Home page for searching and browsing books
- `about.html`  
  Project overview page
- `app.html`  
  Saved books and project-specific functionality
- `app.js`  
  Frontend logic and Fetch API calls
- `style.css`  
  Application styling
- `api/`  
  Serverless backend endpoints
  - `save-book.js` – saves a book into Supabase
  - `saved-books.js` – retrieves saved books from Supabase
- `docs/`  
  Developer documentation

### Installation and Dependencies
1. Clone the repo:
   ```bash
   git clone <https://github.com/MoGit10/Book-Scout-.git>
   cd Book-Scout-

2. Install dependencies:
```bash
npm install

### Running the Application

This project is deployed using Vercel serverless functions.

In production, the application runs automatically when deployed to Vercel,
and backend API routes are served from the `/api` directory.

For optional local development, developers can run:
```bash
vercel dev

### Server API Endpoints
Base:
`https://book-scout-two.vercel.app`

Available endpoints:
1. GET /api/saved-books
Retrieves saved books from the Supabase database.
2. POST /api/save-book
Saves a new book into the Supabase database.

Both endpoints use Supabase with a Service Role key on the server side.

Required environment variables (Vercel + local):
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key


#### POST `/api/save-book`
Saves a book into the `saved_books` table in Supabase.

Request body (JSON):
```json
{
  "work_id": "OL123W",
  "title": "Example Book",
  "author": "Example Author",
  "cover_url": "https://covers.openlibrary.org/b/id/12345-M.jpg"
}

### Known Issues
- No user authentication; all saved books are public.
- No duplicate prevention when saving the same book multiple times.
- Limited error handling on failed external API requests.

### Future Development Roadmap
- Add user authentication via Supabase Auth.
- Prevent duplicate saved books.
- Add delete and update functionality for saved books.
- Improve mobile responsiveness.

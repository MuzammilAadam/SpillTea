# SpillTea — Anonymous Storytelling & Emotional-Support Community

> *“Some things are easier to say here.”*  
> A quiet digital sanctuary where wandering souls can gently pencil their stories, exchange supportive whispers, seal unsent letters in cedar drawers, and arrange Pinterest-inspired scrapbook moodboards with polaroids and pressed flowers.

---

## 🍵 Architecture & Tech Stack

### Backend
- **Framework:** Spring Boot 3.3.5
- **Language:** Java 21 / 24
- **Security:** Spring Security with stateless JWT (JJWT 0.12.6)
- **Database:** MySQL 8.0 (Service: `MySQL80`, Database: `spilltea_db`)
- **Persistence:** Spring Data JPA / Hibernate 6
- **Validation:** Jakarta Bean Validation (`@Valid`, custom validation)
- **Testing:** JUnit 5, Spring Boot Test, MockMvc, in-memory H2

### Frontend
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** Vanilla CSS + Tailwind CSS utilities preserving vintage scrapbook aesthetics (warm cream `#FFF8F0`, sage `#B7B99A`, dried rose `#D8A0A5` / `#B98289`, cedar `#44352F`, polaroid frames, washi tape, wax seals, and paper clips)
- **Icons:** Lucide React + custom SVG botanicals

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Java:** JDK 21 or later (`java -version`)
- **Maven:** 3.8+ (`mvn -version`)
- **Node.js:** 18+ (`npm -version`)
- **MySQL:** 8.0+ running on port `3306`

### 2. Database Configuration
Ensure MySQL is running with the credentials configured in `backend/src/main/resources/application.yml`:
- **Host / Port:** `localhost:3306`
- **Database:** `spilltea_db` (auto-created if configured with `createDatabaseIfNotExist=true`)
- **Username:** `root`
- **Password:** `mysql@2005`

### 3. Run the Backend
```powershell
cd d:\project\SpillTea\backend
mvn spring-boot:run
```
- The backend starts on: **`http://localhost:8080`**
- CORS is configured to allow requests from **`http://localhost:5173`**

### 4. Run Backend Tests
```powershell
cd d:\project\SpillTea\backend
mvn test
```
Tests run against an in-memory H2 database (H2 MySQL compatibility mode) configured in `src/test/resources/application.yml`. All 5 test suites (Auth, Stories, Reactions & Comments, Letters, and Moodboard draft/publish) pass.

### 5. Run the Frontend
```powershell
cd d:\project\SpillTea\FrontEnd
npm install
npm run dev
```
- The frontend dev server starts on: **`http://localhost:5173`**

---

## 📋 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Public? |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account with pseudonym, email, and password | Yes |
| `POST` | `/api/auth/login` | Sign in with email or pseudonym | Yes |
| `POST` | `/api/auth/change-password` | Update current password | No |

### Stories & Comments (`/api/stories`, `/api/comments`)
| Method | Endpoint | Description | Public? |
|---|---|---|---|
| `GET` | `/api/stories` | Public story feed with category/search filter & pagination | Yes |
| `GET` | `/api/stories/{id}` | Read a single story with comments and reaction tallies | Yes |
| `POST` | `/api/stories` | Publish a story (anonymous or with pen name) | No |
| `PUT` | `/api/stories/{id}` | Edit your story | No |
| `DELETE` | `/api/stories/{id}` | Remove your story | No |
| `GET` | `/api/me/stories` | Retrieve authenticated user's published stories | No |
| `GET` | `/api/me/drafts` | Retrieve authenticated user's story drafts | No |
| `PUT` | `/api/stories/{id}/reactions/{type}` | Toggle reaction (`hearYou`, `feltThisToo`, `thankYou`, `sendingSupport`) | No |
| `POST` | `/api/stories/{id}/comments` | Add a comment to a story | No |
| `POST` | `/api/comments/{id}/replies` | Add a nested reply to a comment | No |
| `POST` | `/api/comments/{id}/like` | Toggle like on a comment | No |
| `POST` | `/api/stories/{storyId}/comments/{commentId}/pin` | Pin comment (author only) | No |
| `POST` | `/api/stories/{id}/bookmark` | Toggle bookmark in keepsakes chest | No |

### Scrapbook Moodboard (`/api/moodboards`)
| Method | Endpoint | Description | Public? |
|---|---|---|---|
| `GET` | `/api/moodboards/me` | Fetch authenticated user's moodboard (draft + published) | No |
| `GET` | `/api/profiles/{pseudonym}/moodboard` | Fetch public published moodboard | Yes |
| `PUT` | `/api/moodboards/me/draft` | Save moodboard draft (cards, rotations, styles) | No |
| `POST` | `/api/moodboards/me/publish` | Promote draft moodboard cards to public view | No |
| `POST` | `/api/moodboards/me/discard-draft` | Discard draft changes and restore published cards | No |
| `POST` | `/api/moodboards/me/cards` | Add individual card to moodboard draft | No |
| `PUT` | `/api/moodboards/me/cards/{cardId}` | Update card (text, rotation, washi tape, image) | No |
| `DELETE` | `/api/moodboards/me/cards/{cardId}` | Delete card from moodboard | No |
| `PUT` | `/api/moodboards/me/cards/reorder` | Update card display order | No |
| `POST` | `/api/moodboards/me/cards/image` | Upload photo for polaroid card | No |

### Unsent Letters (`/api/letters`, `/api/public/letters`)
| Method | Endpoint | Description | Public? |
|---|---|---|---|
| `GET` | `/api/public/letters` | Public anonymous unsent letters | Yes |
| `GET` | `/api/me/letters` | Author's private + public sealed letters | No |
| `POST` | `/api/letters` | Pencil a new letter (sealed private or public) | No |
| `PUT` | `/api/letters/{id}` | Edit letter | No |
| `POST` | `/api/letters/{id}/seal` | Mark letter as sealed | No |
| `DELETE` | `/api/letters/{id}` | Burn and delete letter | No |

### Profiles & Keepsakes (`/api/profiles`, `/api/me`)
| Method | Endpoint | Description | Public? |
|---|---|---|---|
| `GET` | `/api/profiles/{pseudonym}` | Fetch public profile and stats | Yes |
| `GET` | `/api/me/profile` | Fetch authenticated user's profile | No |
| `PUT` | `/api/me/profile` | Update profile bio, feeling, accent, avatar | No |
| `POST` | `/api/me/avatar` | Upload custom profile portrait | No |
| `GET` | `/api/me/bookmarks` | List bookmarked keepsakes | No |
| `GET` | `/api/me/notifications` | List user notifications | No |
| `PUT` | `/api/me/notifications/{id}/read` | Mark notification as read | No |
| `PUT` | `/api/me/notifications/read-all` | Mark all notifications as read | No |

---

## 🎨 Frontend Scrapbook Moodboard Features

1. **Direct Canvas Editing:**
   - Click **"Arrange Moodboard"** on your profile page to enter canvas editing mode.
   - Add handwritten notes, polaroids, quote cards, or tea rituals directly on the canvas without plain form redirects.
   - Adjust tilts (`-2°`, `-1°`, `0°`, `+1°`, `+2°`), washi tape colors, and captions.
   - Move cards left and right to reorder.
2. **Draft & Publish Workflow:**
   - **Save Draft:** Stores unpublished edits safely in your desk drawer.
   - **Publish:** Renders your cards publicly for other tea drinkers to view.
   - **Discard:** Reverts all changes back to your last published moodboard.
3. **Pen Name Sign-In & Registration Modal:**
   - Scrapbook-style modal allowing users to create pen names (pseudonyms) and sign in seamlessly.

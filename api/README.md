# Simple Note Taking API

This is a simple RESTful API for managing notes and tags, built with Node.js, Express, and MongoDB.

## Features

* User authentication (register and login with JWT)
* Create, retrieve notes
* Create, retrieve tags
* Associate tags with notes
* Pagination for notes retrieval

## Technologies Used

* **Node.js**: JavaScript runtime
* **Express.js**: Web application framework
* **Mongoose**: MongoDB object modeling for Node.js
* **MongoDB**: NoSQL database
* **bcryptjs**: For password hashing
* **jsonwebtoken**: For generating and verifying JWTs

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/debora-evilaine/note.js.git
    cd api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file in the root directory and add the following environment variables:**

    ```
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```
    * `PORT`: The port your server will run on.
    * `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/notesdb` or a MongoDB Atlas URI).
    * `JWT_SECRET`: A strong, random string for signing JWTs.

4.  **Run the application:**
    ```bash
    npm run dev
    ```

    The API will be running on the port specified in your `.env` file (default: 3000).


## API Endpoints

All API endpoints are prefixed with `/api`. Authentication is required for most endpoints, using a JWT in the `Authorization` header (`Bearer <token>`).

### 1. User Routes (`/api/users`)

* **`POST /api/users/register` - Register a new user**
    * **Description**: Creates a new user account. Passwords are automatically hashed before saving.
    * **Request Body**:
        ```json
        {
            "username": "yourusername",
            "password": "yourpassword"
        }
        ```
    * **Success Response (201 Created)**:
        ```json
        {
            "message": "Usuário registrado com sucesso"
        }
        ```
    * **Error Responses**:
        * `400 Bad Request`: If `username` or `password` are missing, or if `username` already exists.
        * `500 Internal Server Error`: For other server-side errors.

* **`POST /api/users/login` - User login**
    * **Description**: Authenticates a user and returns a JSON Web Token (JWT).
    * **Request Body**:
        ```json
        {
            "username": "yourusername",
            "password": "yourpassword"
        }
        ```
    * **Success Response (200 OK)**:
        ```json
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
        ```
    * **Error Responses**:
        * `400 Bad Request`: If `username` or `password` are missing.
        * `401 Unauthorized`: If `username` or `password` are incorrect.
        * `500 Internal Server Error`: For other server-side errors.

### 2. Note Routes (`/api/notes`)

* **Authentication Required**

* **`POST /api/notes` - Create a new note**
    * **Description**: Creates a new note for the authenticated user.
    * **Request Body**:
        ```json
        {
            "title": "My first note",
            "content": "This is the content of my first note."
        }
        ```
    * **Success Response (201 Created)**:
        ```json
        {
            "_id": "60c72b2f9b1d8c001c8e4a1a",
            "title": "My first note",
            "content": "This is the content of my first note.",
            "user": "60c72b2f9b1d8c001c8e4a1b",
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:00:00.000Z",
            "__v": 0
        }
        ```
    * **Error Responses**:
        * `400 Bad Request`: If `title` or `content` are missing.
        * `401 Unauthorized`: If no token is provided or token is invalid.
        * `500 Internal Server Error`: For other server-side errors.

* **`GET /api/notes` - Get all notes with pagination**
    * **Description**: Retrieves all notes belonging to the authenticated user with optional pagination.
    * **Query Parameters**:
        * `page` (optional): Page number (default: 1).
        * `limit` (optional): Number of notes per page (default: 10).
    * **Success Response (200 OK)**:
        ```json
        {
            "notes": [
                {
                    "_id": "60c72b2f9b1d8c001c8e4a1a",
                    "title": "My first note",
                    "content": "This is the content of my first note.",
                    "user": "60c72b2f9b1d8c001c8e4a1b",
                    "createdAt": "2023-10-27T10:00:00.000Z",
                    "updatedAt": "2023-10-27T10:00:00.000Z",
                    "__v": 0
                }
            ],
            "totalPages": 1,
            "currentPage": 1
        }
        ```
    * **Error Responses**:
        * `401 Unauthorized`: If no token is provided or token is invalid.
        * `500 Internal Server Error`: For other server-side errors.

* **`GET /api/notes` - Get all notes with pagination**
    * **Description**: Retrieves all notes by text belonging to the authenticated user with optional pagination.
    * **Query Parameters**:
        * `search`: Search text of the note title. 
        * `page` (optional): Page number (default: 1).
        * `limit` (optional): Number of notes per page (default: 10).
    * **Success Response (200 OK)**:
        ```json
        {
            "notes": [
                {
                    "_id": "60c72b2f9b1d8c001c8e4a1a",
                    "title": "My first note",
                    "content": "This is the content of my first note.",
                    "user": "60c72b2f9b1d8c001c8e4a1b",
                    "createdAt": "2023-10-27T10:00:00.000Z",
                    "updatedAt": "2023-10-27T10:00:00.000Z",
                    "__v": 0
                }
            ],
            "totalPages": 1,
            "currentPage": 1
        }
        ```
    * **Error Responses**:
        * `401 Unauthorized`: If no token is provided or token is invalid.
        * `500 Internal Server Error`: For other server-side errors.

### 3. Tag Routes (`/api/tags`)

* **Authentication Required**

* **`POST /api/tags` - Create a new tag**
    * **Description**: Creates a new tag for the authenticated user.
    * **Request Body**:
        ```json
        {
            "name": "Work",
            "color": "#FF0000"
        }
        ```
    * **Success Response (201 Created)**:
        ```json
        {
            "_id": "60c72b2f9b1d8c001c8e4a1c",
            "name": "Work",
            "color": "#FF0000",
            "user": "60c72b2f9b1d8c001c8e4a1b",
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:00:00.000Z",
            "__v": 0
        }
        ```
    * **Error Responses**:
        * `400 Bad Request`: If `name` or `color` are missing.
        * `401 Unauthorized`: If no token is provided or token is invalid.
        * `500 Internal Server Error`: For other server-side errors.

* **`GET /api/tags` - Get all tags**
    * **Description**: Retrieves all tags belonging to the authenticated user.
    * **Success Response (200 OK)**:
        ```json
        {
            "tags": [
                {
                    "_id": "60c72b2f9b1d8c001c8e4a1c",
                    "name": "Work",
                    "color": "#FF0000",
                    "user": "60c72b2f9b1d8c001c8e4a1b",
                    "createdAt": "2023-10-27T10:00:00.000Z",
                    "updatedAt": "2023-10-27T10:00:00.000Z",
                    "__v": 0
                }
            ]
        }
        ```
    * **Error Responses**:
        * `401 Unauthorized`: If no token is provided or token is invalid.
        * `500 Internal Server Error`: For other server-side errors.

* **`POST /api/tags/note` - Relate a tag to a note**
    * **Description**: Associates an existing tag with an existing note for the authenticated user.
    * **Request Body**:
        ```json
        {
            "tagId": "60c72b2f9b1d8c001c8e4a1c",
            "noteId": "60c72b2f9b1d8c001c8e4a1a"
        }
        ```
    * **Success Response (201 Created)**:
        ```json
        {
            "_id": "60c72b2f9b1d8c001c8e4a1d",
            "tagId": "60c72b2f9b1d8c001c8e4a1c",
            "noteId": "60c72b2f9b1d8c001c8e4a1a",
            "user": "60c72b2f9b1d8c001c8e4a1b",
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:00:00.000Z",
            "__v": 0
        }
        ```
    * **Error Responses**:
        * `400 Bad Request`: If `tagId` or `noteId` are missing, or if the provided `tagId` or `noteId` are not found.
        * `401 Unauthorized`: If no token is provided or token is invalid.
        * `500 Internal Server Error`: For other server-side errors.

* **`GET /api/tags/note/:noteId` - Get tags for a specific note**
    * **Description**: Retrieves all tags associated with a specific note for the authenticated user.
    * **URL Parameters**:
        * `noteId`: The ID of the note.
    * **Success Response (200 OK)**:
        ```json
        {
            "note": {
                "_id": "60c72b2f9b1d8c001c8e4a1a",
                "title": "My first note",
                "content": "This is the content of my first note.",
                "user": "60c72b2f9b1d8c001c8e4a1b",
                "createdAt": "2023-10-27T10:00:00.000Z",
                "updatedAt": "2023-10-27T10:00:00.000Z",
                "__v": 0
            },
            "tags": [
                {
                    "_id": "60c72b2f9b1d8c001c8e4a1c",
                    "name": "Work",
                    "color": "#FF0000",
                    "user": "60c72b2f9b1d8c001c8e4a1b",
                    "createdAt": "2023-10-27T10:00:00.000Z",
                    "updatedAt": "2023-10-27T10:00:00.000Z",
                    "__v": 0
                }
            ]
        }
        ```
    * **Error Responses**:
        * `404 Not Found`: If the `noteId` is not found.
        * `401 Unauthorized`: If no token is provided or token is invalid.
        * `500 Internal Server Error`: For other server-side errors.

## Data Models

### User (`src/models/User.js`)

* `username`: String, required, unique
* `password`: String, required (hashed using bcryptjs)
* `createdAt`: Date (automatically added by Mongoose)
* `updatedAt`: Date (automatically added by Mongoose)

### Note (`src/models/Notes.js`)

* `title`: String, required
* `content`: String, required
* `user`: ObjectId (refers to `User` model), required
* `createdAt`: Date (automatically added by Mongoose)
* `updatedAt`: Date (automatically added by Mongoose)

### Tag (`src/models/Tags.js`)

* `name`: String, required
* `color`: String, required
* `user`: ObjectId (refers to `User` model), required
* `createdAt`: Date (automatically added by Mongoose)
* `updatedAt`: Date (automatically added by Mongoose)

### NoteTag (`src/models/NotesTags.js`)

* `tagId`: String, required (ID of the Tag)
* `noteId`: String, required (ID of the Note)
* `user`: ObjectId (refers to `User` model), required
* `createdAt`: Date (automatically added by Mongoose)
* `updatedAt`: Date (automatically added by Mongoose)

## Authentication Middleware

The `authenticate` middleware is used to protect routes. It expects a JWT in the `Authorization` header in the format `Bearer <token>`.

* If no token is provided, it returns `401 Unauthorized`.
* If the token is invalid, it returns `401 Unauthorized`.
* If the token is valid, it decodes the user ID and attaches it to `req.userId` before calling `next()`.

---
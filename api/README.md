# Simple Note Taking API

This is a simple RESTful API for managing notes and tags, built with Node.js, Express, and MongoDB.

## Features

  * User authentication (register and login with JWT)
  * Create, retrieve, update, and delete notes
  * Create, retrieve, and delete tags
  * Associate tags with notes directly within the note object

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

3.  **Create a `.env` file in the `api` directory and add the following environment variables:**

    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

      * `PORT`: The port your server will run on (the front-end expects `5000`).
      * `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/notesdb` or a MongoDB Atlas URI).
      * `JWT_SECRET`: A strong, random string for signing JWTs.

4.  **Run the application:**

    ```bash
    npm run dev
    ```

    The API will be running on the port specified in your `.env` file.

## API Endpoints

All API endpoints are prefixed with `/api`. Authentication is required for all note and tag endpoints, using a JWT in the `Authorization` header (`Bearer <token>`).

### 1\. User Routes (`/api/users`)

  * **`POST /api/users/register` - Register a new user**

      * **Description**: Creates a new user account. Passwords are automatically hashed before saving.
      * **Request Body**:
        ```json
        {
            "name": "Your Name",
            "email": "your@email.com",
            "password": "yourpassword"
        }
        ```
      * **Success Response (201 Created)**:
        ```json
        {
            "message": "Usuário registrado com sucesso",
            "user": {
                "id": "60c72b2f9b1d8c001c8e4a1b",
                "nome": "Your Name",
                "email": "your@email.com"
            }
        }
        ```

  * **`POST /api/users/login` - User login**

      * **Description**: Authenticates a user and returns a JSON Web Token (JWT).
      * **Request Body**:
        ```json
        {
            "email": "your@email.com",
            "password": "yourpassword"
        }
        ```
      * **Success Response (200 OK)**:
        ```json
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": "60c72b2f9b1d8c001c8e4a1b",
                "email": "your@email.com"
            }
        }
        ```

### 2\. Note Routes (`/api/notes`)

  * **Authentication Required**

  * **`GET /api/notes` - Get all notes**

      * **Description**: Retrieves all notes belonging to the authenticated user.
      * **Success Response (200 OK)**:
        ```json
        {
            "notes": [
                {
                    "id": "60c72b2f9b1d8c001c8e4a1a",
                    "title": "My First Note",
                    "content": "This is the content.",
                    "user": "60c72b2f9b1d8c001c8e4a1b",
                    "tagIds": ["60c72b2f9b1d8c001c8e4a1c"],
                    "createdAt": "2023-10-27T10:00:00.000Z",
                    "updatedAt": "2023-10-27T10:00:00.000Z"
                }
            ]
        }
        ```

  * **`POST /api/notes` - Create a new note**

      * **Description**: Creates a new note. `tagIds` is an array of Tag IDs and is optional.
      * **Request Body**:
        ```json
        {
            "title": "My New Note",
            "content": "Content of the new note.",
            "tagIds": ["60c72b2f9b1d8c001c8e4a1c"]
        }
        ```
      * **Success Response (201 Created)**: Returns the newly created note object.

  * **`PUT /api/notes/:id` - Update a note**

      * **Description**: Updates an existing note by its ID.
      * **Request Body**:
        ```json
        {
            "title": "Updated Note Title",
            "content": "Updated content.",
            "tagIds": ["60c72b2f9b1d8c001c8e4a1c", "60c72b2f9b1d8c001c8e4a1d"]
        }
        ```
      * **Success Response (200 OK)**: Returns the updated note object.

  * **`DELETE /api/notes/:id` - Delete a note**

      * **Description**: Deletes a note by its ID.
      * **Success Response (204 No Content)**.

### 3\. Tag Routes (`/api/tags`)

  * **Authentication Required**

  * **`GET /api/tags` - Get all tags**

      * **Description**: Retrieves all tags belonging to the authenticated user.
      * **Success Response (200 OK)**:
        ```json
        {
            "tags": [
                {
                    "id": "60c72b2f9b1d8c001c8e4a1c",
                    "name": "Work",
                    "color": "#FF0000",
                    "user": "60c72b2f9b1d8c001c8e4a1b",
                    "createdAt": "2023-10-27T10:00:00.000Z",
                    "updatedAt": "2023-10-27T10:00:00.000Z"
                }
            ]
        }
        ```

  * **`POST /api/tags` - Create a new tag**

      * **Description**: Creates a new tag.
      * **Request Body**:
        ```json
        {
            "name": "Personal",
            "color": "#3b82f6"
        }
        ```
      * **Success Response (201 Created)**: Returns the newly created tag object.

  * **`DELETE /api/tags/:id` - Delete a tag**

      * **Description**: Deletes a tag by its ID and removes it from any notes that have it.
      * **Success Response (204 No Content)**.

## Data Models

### User (`src/models/User.js`)

  * `name`: String, required
  * `email`: String, required, unique
  * `password`: String, required (hashed)

### Note (`src/models/Notes.js`)

  * `title`: String, required
  * `content`: String, required
  * `user`: ObjectId (refers to `User` model), required
  * `tagIds`: Array of ObjectId (refers to `Tag` model)

### Tag (`src/models/Tags.js`)

  * `name`: String, required
  * `color`: String, required
  * `user`: ObjectId (refers to `User` model), required
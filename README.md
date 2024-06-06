
# Movie Info API

## Overview

The Movie Info API is a RESTful web service built with Node.js, Express, and MongoDB. It allows users to manage their movie collection and user accounts, including features like adding movies to favorites, retrieving movie details, and handling user authentication with JWT.

## Prerequisites

- Node.js and npm
- MongoDB (local or Atlas)
- A MongoDB Atlas URI or a local MongoDB connection URI
- Git

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/movie-info-api.git
   cd movie-info-api
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB Atlas URI:

   ```env
   CONNECTION_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
   PORT=8080
   ```

## Usage

1. Start the server:

   ```sh
   npm start
   ```

2. The API will be available at `http://localhost:8080`.

## Endpoints

### User Endpoints

- **Get all users**

  ```http
  GET /users
  ```

- **Get a user by username**

  ```http
  GET /users/:username
  ```

- **Create a new user**

  ```http
  POST /users
  ```

  Example JSON body:

  ```json
  {
    "username": "exampleUser",
    "password": "examplePassword",
    "email": "user@example.com",
    "birthday": "1990-01-01"
  }
  ```

- **Update a user's info**

  ```http
  PUT /users/:username
  ```

- **Delete a user by username**

  ```http
  DELETE /users/:username
  ```

- **Add a movie to a user's list of favorites**

  ```http
  POST /users/:username/movies/:movieId
  ```

- **Remove a movie from a user's list of favorites**

  ```http
  DELETE /users/:username/movies/:movieId
  ```

### Movie Endpoints

- **Get all movies**

  ```http
  GET /movies
  ```

- **Get a single movie by title**

  ```http
  GET /movies/:title
  ```

- **Get a genre by name**

  ```http
  GET /movies/genre/:name
  ```

- **Get a director by name**

  ```http
  GET /movies/director/:name
  ```

## Authentication

The API uses JWT for authentication. You must include a valid JWT token in the `Authorization` header of your requests.

## Logging

Requests are logged using `morgan` and saved to `log.txt`.

## CORS

The API uses CORS to allow requests from specified origins. Update the `allowedOrigins` array to include any additional origins.

## Error Handling

Errors are handled and logged, with a generic message sent to the client for unexpected errors.

## Documentation

API documentation is available at:

```http
GET /documentation
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

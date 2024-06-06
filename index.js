const express = require('express');
const passport = require('passport');
require('./passport');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const uuid = require('uuid');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Models = require('./models.js');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const app = express();

const Movies = Models.Movie;
const Users = Models.User;

// Local MongoDB connection
//mongoose.connect("mongodb://localhost:27017/ACDB", { useNewUrlParser: true, useUnifiedTopology: true });

// MongoDB Atlas connection
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'http://localhost:4200', 'http://testsite.com', 'https://artcine.netlify.app', 'https://4ndrew-42.github.io'];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				let message = "The CORS policy for this application doesn't allow access from origin " + origin;
				return callback(new Error(message), false);
			}
			return callback(null, true);
		},
		methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
		allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
	})
);

let auth = require('./auth')(app);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/documentation', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'documentation.html'));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROUTING

/**
 * @api {get} /users Get all users
 * @apiName GetUsers
 * @apiGroup User
 * @apiDescription This endpoint returns a list of all users.
 * 
 * @apiSuccess {Object[]} users List of users.
 */
// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
	await Users.find()
		.then((users) => {
			res.status(200).json(users);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * @api {get} /users/:username Get a user by username
 * @apiName GetUserByUsername
 * @apiGroup User
 * @apiDescription This endpoint returns a user by their username.
 * 
 * @apiParam {String} username The username of the user to retrieve.
 * 
 * @apiSuccess {Object} user User data.
 */
// Get a user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const user = await Users.findOne({ username: req.params.username });
		if (!user) {
			return res.status(404).send('User not found');
		}
		res.status(200).json(user);
	} catch (err) {
		console.error(err);
		res.status(500).send('Error: ' + err);
	}
});

/**
 * @api {get} /movies Get all movies
 * @apiName GetMovies
 * @apiGroup Movie
 * @apiDescription This endpoint returns a list of all movies.
 * 
 * @apiSuccess {Object[]} movies List of movies.
 */
// #1 JSON data for movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
	await Movies.find()
		.then((movies) => {
			res.status(201).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * @api {get} /movies/:title Get a movie by title
 * @apiName GetMovieByTitle
 * @apiGroup Movie
 * @apiDescription This endpoint returns a movie by its title.
 * 
 * @apiParam {String} title The title of the movie to retrieve.
 * 
 * @apiSuccess {Object} movie Movie data.
 */
// #2 JSON data for a single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
	await Movies.findOne({ title: req.params.title })
		.then((movie) => {
			res.status(201).json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * @api {get} /movies/genre/:name Get movies by genre
 * @apiName GetMoviesByGenre
 * @apiGroup Movie
 * @apiDescription This endpoint returns movies by their genre.
 * 
 * @apiParam {String} name The name of the genre.
 * 
 * @apiSuccess {Object} genre Genre data.
 */
// #3 JSON data for a genre by name
app.get('/movies/genre/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
	await Movies.findOne({ 'genre.name': req.params.name })
		.then((movie) => {
			res.status(201).json(movie.genre);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * @api {get} /movies/director/:name Get movies by director
 * @apiName GetMoviesByDirector
 * @apiGroup Movie
 * @apiDescription This endpoint returns movies by their director.
 * 
 * @apiParam {String} name The name of the director.
 * 
 * @apiSuccess {Object} director Director data.
 */
// #4 JSON data for a director by name
app.get('/movies/director/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
	await Movies.findOne({ 'director.name': req.params.name })
		.then((movie) => {
			res.status(201).json(movie.director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Add a user
/**
 * @api {post} /users Add a new user
 * @apiName AddUser
 * @apiGroup User
 * @apiDescription This endpoint adds a new user.
 * 
 * @apiParam {String} username The username of the user.
 * @apiParam {String} password The password of the user.
 * @apiParam {String} email The email of the user.
 * @apiParam {Date} birthday The birthday of the user.
 * 
 * @apiSuccess {Object} user The created user.
 */
/* We’ll expect JSON in this format
{
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post(
	'/users',
	[
		check('username', 'Username is required').isLength({ min: 5 }),
		check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
		check('password', 'Password is required').not().isEmpty().isLength({ min: 8, max: 20 }),
		check('email', 'Email does not appear to be valid').isEmail(),
		check('birthday', 'Birthday is required').isDate().optional({ checkFalsy: true }),
	],
	async (req, res) => {
		// check the validation object for errors
		let errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		let hashedPassword = Users.hashPassword(req.body.password);
		await Users.findOne({ username: req.body.username })
			.then((user) => {
				if (user) {
					return res.status(400).send(req.body.username + 'already exists');
				} else {
					Users.create({
						username: req.body.username,
						password: hashedPassword,
						email: req.body.email,
						birthday: req.body.birthday,
					})
						.then((user) => {
							res.status(201).json(user);
						})
						.catch((error) => {
							console.error(error);
							res.status(500).send('Error: ' + error);
						});
				}
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

/**
 * @api {put} /users/:username Update a user's info
 * @apiName UpdateUser
 * @apiGroup User
 * @apiDescription This endpoint updates a user's information.
 * 
 * @apiParam {String} username The username of the user to update.
 * @apiParam {Object} userInfo The updated user information.
 * 
 * @apiSuccess {Object} user The updated user data.
 */
// #6 Update a user's info by username
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
	if (req.user.username !== req.params.username) {
		return res.status(400).send('Permission denied');
	}
	await Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$set: {
				username: req.body.username,
				password: req.body.password,
				email: req.body.email,
				birthday: req.body.birthday,
			},
		},
		{ new: true }
	)
		.then((updatedUser) => {
			res.json(updatedUser);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});
/**
 * @api {post} /users/:username/movies/:movieId Add a movie to a user's list of favorites
 * @apiName AddFavoriteMovie
 * @apiGroup User
 * @apiDescription This endpoint adds a movie to a user's list of favorite movies.
 * 
 * @apiParam {String} username The username of the user.
 * @apiParam {String} movieId The ID of the movie to add.
 * 
 * @apiSuccess {Object} user The updated user data.
 */
// Add a movie to a user's list of favorites
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$addToSet: { favoriteMovies: req.params.movieId },
		},
		{ new: true }
	)
		.then((updatedUser) => {
			res.json(updatedUser);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * @api {delete} /users/:username/movies/:movieId Remove a movie from a user's list of favorites
 * @apiName RemoveFavoriteMovie
 * @apiGroup User
 * @apiDescription This endpoint removes a movie from a user's list of favorite movies.
 * 
 * @apiParam {String} username The username of the user.
 * @apiParam {String} movieId The ID of the movie to remove.
 * 
 * @apiSuccess {Object} user The updated user data.
 */

app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$pull: { favoriteMovies: req.params.movieId },
		},
		{ new: true }
	)
		.then((updatedUser) => {
			res.json(updatedUser);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * @api {delete} /users/:username Delete a user by username
 * @apiName DeleteUser
 * @apiGroup User
 * @apiDescription This endpoint deletes a user by their username.
 * 
 * @apiParam {String} username The username of the user to delete.
 * 
 * @apiSuccess {String} message Success message.
 */

// Delete a user by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
	console.log('Attempting to delete user:', req.params.username); // Debugging line
	try {
		const user = await Users.findOneAndRemove({ username: req.params.username });
		if (!user) {
			return res.status(404).send('User not found');
		}
		res.status(200).send('User deleted successfully');
	} catch (err) {
		console.error('Error during deletion:', err); // More detailed error logging
		res.status(500).send('Server error');
	}
});

require('./auth')(router);

app.use('/', router);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on Port ' + port);
});

// MongoDB connection error handling
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {Fave} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

//FETCHES FAVORITES LIST FROM DB, CREATES DB ENTRY IF NEW USER
router.post('/get', jsonParser, passport.authenticate('jwt', {session: false}),
	(req, res) => {
	let getRequestID = req.body.userID;
	return Fave.find()
		.then(users => {
			return users.filter(obj => obj.userID === getRequestID);
		})
		.then(user => {
			if (user.length === 0) {
				return Fave.create({
					userID: getRequestID
				});
			}
			else {
				return user[0];
			}
		})
		.then(user => {
			return res.json(user.apiRepr());
		})
		.catch(err => {
			res.status(500).json({message: 'Internal server error'});
			console.log(err);
			});
});

//ADDS FAVORITE TO USER'S FAVORITES LIST
router.post('/add', jsonParser, passport.authenticate('jwt', {session: false}),
	(req, res) => {
	let addRequestID = req.body.userID;
	let favoriteArtist = req.body.favoriteArtist;
	return Fave.update(
		{userID: addRequestID},
		{
			$addToSet: {
				favorites: {
					$each: [favoriteArtist],
				}
			}
		})
		.then(() => {
				return Fave.update(
					{userID: addRequestID},
					{
						$push: {
							favorites: {
							$each: [],
							$sort: 1
							}
						}
					})
		})
		.then(() => {
			return res.status(200).json({message: `${favoriteArtist} added to favorites!`})
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

//REMOVE FAVORITE FROM USER'S FAVORITES LIST
router.post('/del', jsonParser, passport.authenticate('jwt', {session: false}),
	(req, res) => {
	let delRequestID = req.body.userID;
	let deleteArtist = req.body.deleteArtist;
	return Fave.update(
		{userID: delRequestID},
		{
			$pull: {
				favorites: deleteArtist
			}
		})
		.then(() => {
			return res.status(200).json({message: `${deleteArtist} removed from favorites.`})
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};
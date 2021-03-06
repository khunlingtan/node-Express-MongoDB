const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ "user": req.user._id })
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ "user": req.user._id })
      .then((favorites) => {
        if (favorites != null) {
          req.body.forEach((dish) => {
            if (favorites.dishes.find((item) => item == dish._id) == undefined)
            favorites.dishes.push(dish);
          });
          favorites.save()
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, (err) => next(err));
        }
        else {
          Favorites.create({
            user: req.user._id,
            dishes: req.body
          })
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({ "user": req.user._id })
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);     
      }, (err) => next(err))
      .catch ((err) => next(err));
  });

favoriteRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (!favorites) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json({ "exists": false, "favorites": favorites });
        }
        else {
          if (favorites.dishes.indexOf(req.params.dishId) < 0) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ "exists": false, "favorites": favorites });
          }
          else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ "exists": true, "favorites": favorites });
          }
        }

      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ "user": req.user._id })
      .then((favorites) => {
        if (favorites != null) {
          if (favorites.dishes.find((item) => item == req.params.dishId) == undefined)
            favorites.dishes.push(req.params.dishId);
          favorites.save()
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, (err) => next(err));
        }
        else {
          Favorites.create({
            user: req.user._id,
            dishes: req.params.dishId
          })
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:dishId');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ "user": req.user._id })
      .then((favorites) => {
        index = favorites.dishes.indexOf(req.params.dishId);
        if (index !== -1) {
          favorites.dishes.splice(index, 1);
          favorite.save()
            .then((favorite) => {
              Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                  console.log('Favorite Dish Deleted!', favorite);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                })
            })
        }
        else {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
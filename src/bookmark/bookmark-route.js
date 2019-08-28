const express = require('express');
const logger = require('../logger');
//const store = require('../store')
const uuid = require('uuid/v4');
const xss = require('xss');
const BookmarksService = require('./bookmark-service');

const bookmarkRoute = express.Router();
const bodyParser = express.json();

bookmarkRoute.route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
      const newBookmarks = bookmarks.map(bookmark => {
        return {
          id:bookmark.id,
          title: xss(bookmark.title),
          description: xss(bookmark.description),
          url: xss(bookmark.url),
          rating: bookmark.rating
        }
      });
      res.json(newBookmarks);
    })
    .catch(next);
  })
  .post((req, res, next) => {
    const { title, url, description, rating } = req.body

    if (!title) {
      logger.error('title required');
      return res.status(400).send('title required')
    }

    if (!url) {
      logger.error('url required');
      return res.status(400).send('url required')
    }

    if (!description) {
      logger.error('description required');
      return res.status(400).send('description required')
    }

    if (!rating) {
      logger.error('rating required');
      return res.status(400).send('rating required')
    }

    if (rating < 1 || rating > 5) {
      logger.error('rating should be between 1 and 5');
      return res.status(400).send('rating should be between 1 and 5')
    }

    //const id = uuid()

    const bookmark = {
      title,
      url,
      description,
      rating
    }

    //store.push(bookmark)
    const knexInstance = req.app.get('db');
    BookmarksService.insertBookmark(knexInstance, bookmark)
    .then(bookmark => {
      res
      .status(201)
      .json({
        id:bookmark.id,
        title: xss(bookmark.title),
        description: xss(bookmark.description),
        url: xss(bookmark.url),
        rating: bookmark.rating
      })
    })
    .catch(next);
  })


bookmarkRoute.route('/:id')
  .get((req, res, next) => {
    const { id } = req.params

    const knexInstance = req.app.get('db');
    BookmarksService.getById(knexInstance, id)
    .then(bookmark => {
      if (bookmark) {
        logger.info(`bookmark with id ${id} found`)
        return res.send({
          id:bookmark.id,
          title: xss(bookmark.title),
          description: xss(bookmark.description),
          url: xss(bookmark.url),
          rating: bookmark.rating
        })
      }
      logger.error(`bookmark with id ${id} not found`)
      return res.status(404).send('bookmark not found')
    })
    .catch(next);


  })
  .delete((req, res, next) => {
    const { id } = req.params

    const knexInstance = req.app.get('db');
    BookmarksService.deleteBookmark(knexInstance, id)
    .then(bookmark => {
      logger.info(`bookmark with id ${id} deleted`)
      res.status(204).send('Deleted').end();
    })
    .catch(next);

  })

module.exports = bookmarkRoute;

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmark.fixtures.js');

describe('Bookmarks Endpoints', function() {
let db;

before('make knex instance', () => {
    db = knex({
        client:'pg',
        connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
});

const cleanBookmarks = () => db('bookmark').truncate();
before('clean the table', cleanBookmarks);
afterEach('clean the table', cleanBookmarks);

after('disconnect from db', () => db.destroy());


  describe('GET /bookmarks', () => {
    context('Given bookmarks exist', () => {
      const testbookmarks = makeBookmarksArray();

      beforeEach(() => {
        return db
          .insert(testbookmarks)
          .into('bookmark');
      });

      it('responds 200 with bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, testbookmarks);
      });
    })
  });

  describe(`POST /bookmarks`, () => {
    it(`creates an bookmark, responding with 201 and the new bookmark`, function() {
      this.retries(3)
      const newBookmark = {
        title: 'Test new article',
        url: 'www.some.com',
        description: 'Test new article content...',
        rating: 3
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body).to.have.property('id')
          //expect(res.headers.location).to.eql(`/articles/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/bookmarks/${res.body.id}`)
            .expect(res.body)
        )
    })
  })

  it(`creates an bookmark, responding with 400 when format incorrect`, function() {
    this.retries(3)
    const newBookmark = {
      title: 'Test new article',
      url: 'www.some.com',
      description: 'Test new article content...',
      rating: 9
    }
    return supertest(app)
      .post('/bookmarks')
      .send(newBookmark)
      .expect(400)
  })

  describe('DELETE /bookmarks/:id', () => {
    it('With no correct id', () => {
      const incorrectId = 345345;
      return supertest(app)
        .delete(`/bookmark/${incorrectId}`)
        .expect(404)
    })

    context('With existing bookmark', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmark')
          .insert(testBookmarks)
      })

      it('Delete bookmark', () => {
        const idToRemove = 2
        const expectedArticles = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/bookmarks`)
              .expect(expectedArticles)
            )
      })
    })
  })

});

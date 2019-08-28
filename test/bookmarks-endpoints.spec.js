const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarkArray } = require('./bookmark.fixtures.js');

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

after('disconnect from db', () => db.destory());


describe('GET /bookmark', () => {
  context('Given bookmarks exist', () => {
    const testbookmarks = makeArticlesArray();

    beforeEach(() => {
      return db
        .insert(testbookmarks)
        .into('bookmark');
    });

    it('responds 200 with bookmarks', () => {
      return supertest(app)
        .get('/bookmark')
        .expect(200, testbookmarks);
    });
  })
});
});


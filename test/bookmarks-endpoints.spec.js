const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

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
});
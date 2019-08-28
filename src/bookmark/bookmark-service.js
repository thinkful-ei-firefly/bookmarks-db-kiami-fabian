const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmark');
    },
    insertBookmark(knex, newBookmark) {
        return knex
        .insert(newBookmark)
        .into('bookmark')
        .returning('*')
        .then(rows => {
            return rows[0];
        });
    },
    getById(knex, id) {
        return knex
        .from('bookmark')
        .select('*')
        .where('id', id)
        .first();
    },
    deleteBookmark(knex, id) {
        return knex('bookmark')
        .where({ id })
        .delete();
    },
    updateBookmark(knex, id, newBookmarkStore) {
        return knex('bookmark')
        .where({ id })
        .update(newBookmarkStore);
    }
};

module.exports = BookmarksService;

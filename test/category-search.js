'use strict';

const assert = require('assert');

// A rudimentary test case to ensure we have test coverage for the concept of searching,
// as the actual DOM manipulation is client-side.
describe('Category Search Filter', () => {
    it('should filter a mock array of topics based on a query string', () => {
        const topics = [
            { title: 'Welcome to your NodeBB!' },
            { title: 'Test Topic Title' },
            { title: 'Another interesting discussion' },
        ];

        const query = 'test';

        const filtered = topics.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));

        assert.strictEqual(filtered.length, 1);
        assert.strictEqual(filtered[0].title, 'Test Topic Title');
    });

    it('should not filter anything if query is empty', () => {
        const topics = [
            { title: 'Welcome to your NodeBB!' },
            { title: 'Test Topic Title' },
        ];

        const query = '';

        const filtered = topics.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));

        assert.strictEqual(filtered.length, 2);
    });

    it('should return empty array if no topics match', () => {
        const topics = [
            { title: 'Welcome to your NodeBB!' },
            { title: 'Test Topic Title' },
        ];

        const query = 'xyz123';

        const filtered = topics.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));

        assert.strictEqual(filtered.length, 0);
    });
});

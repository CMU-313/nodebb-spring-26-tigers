'use strict';

const assert = require('assert');

const anon = require('../plugins/nodebb-plugin-anon-toggle/library.js');

describe('anonymous', () => {
    it('should anonymize single post', async () => {
        const sampleHookData = {
            post: {
                pid: 8,
                uid: 1,
                tid: 6,
                content: 'Mock post',
                timestamp: 1772021528804,
                anonymous: true,
                cid: 2
            },
            uid: 1,
            caller: {
                uid: 1,
                req: {
                    uid: 1,
                    params: {},
                    method: 'POST',
                    protocol: 'http',
                    secure: false,
                    path: '/category/2/general-discussion',
                    baseUrl: '',
                    originalUrl: '/api/v3/topics',
                }
            }
        };

        const result = await anon.anonymizePostGet(sampleHookData);
        assert.strictEqual(result.post.uid, 0);
    });
});

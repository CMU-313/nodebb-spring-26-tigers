'use strict';

const assert = require('assert');

const nconf = require('nconf');
const path = require('path');
const util = require('util');

const sleep = util.promisify(setTimeout);

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const categories = require('../src/categories');
const user = require('../src/user');
const postsIndex = require('../src/posts/index')
const library = require('../plugins/nodebb-plugin-anon-toggle/library')

describe('anonymous', () => {
    let uid
    let anonPostData1, anonPostData2, postData;
    let anonTopicData1, anonTopicData2, topicData;
    let cid;

    before(async () => {
        uid = await user.create({ username: 'Test User' });
        ({ cid } = await categories.create({
            name: 'Test Category',
            description: 'Test category created by testing script',
        }));
        ({ topicData: anonTopicData1, postData: anonPostData1 } = await topics.post({
            uid: uid,
            cid: cid,
            title: 'Anon Test Topic Title 1',
            content: 'The content of test topic',
            anonymous: 'true'
        }));
        ({ topicData: anonTopicData2, postData: anonPostData2 } = await topics.post({
            uid: uid,
            cid: cid,
            title: 'Anon Test Topic Title 2',
            content: 'The content of test topic',
            anonymous: 'true'
        }));
        ({ topicData, postData } = await topics.post({
            uid: uid,
            cid: cid,
            title: 'Test Topic Title',
            content: 'The content of test topic'
        }));
    });

    it('should anonymize single anonymous post', async () => {
        const sampleHookData = {post: anonPostData1, uid: uid}

        const result = await library.anonymizePostGet(sampleHookData);
        assert.strictEqual(result.post.uid, 0);
    });

    it('should not anonymize single normal post', async () => {
        const sampleHookData = {post: postData, uid: uid}

        const result = await library.anonymizePostGet(sampleHookData);
        assert.strictEqual(result.post.uid, uid);
    });

    it('should batch anonymize posts', async () => {
        const posts = await postsIndex.getPostsByPids([anonPostData1.pid, anonPostData2.pid], uid)
        const sampleHookData = {posts: posts, uid: uid}

        const result = await library.anonymizePostsGet(sampleHookData);
        result.posts.forEach((post) => {
            if (post.pid == anonPostData1.pid || post.pid == anonPostData2.pid) {
                assert.strictEqual(post.uid, 0);
            }
            else {
                assert.strictEqual(post.uid, uid);
            }
        })
    });
});

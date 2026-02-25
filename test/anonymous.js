'use strict';

const assert = require('assert');

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const categories = require('../src/categories');
const user = require('../src/user');
const postsIndex = require('../src/posts/index');
const topicsIndex = require('../src/topics/index');
const library = require('../plugins/nodebb-plugin-anon-toggle/library');

const { JSDOM } = require('jsdom');

describe('anonymizing topics and posts', () => {
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

    it('should anonymize single anonymous topic', async () => {
        const sampleHookData = {topic: anonTopicData1, uid: uid}

        const result = await library.anonymizeTopicGet(sampleHookData);
        assert.strictEqual(result.topic.uid, 0);
    });

    it('should not anonymize single normal topic', async () => {
        const sampleHookData = {topic: topicData, uid: uid}

        const result = await library.anonymizeTopicGet(sampleHookData);
        assert.strictEqual(result.topic.uid, 1);
    });

    it('should batch anonymize topics', async () => {
        const topics = await topicsIndex.getTopicsByTids([anonTopicData1.tid, anonTopicData2.tid], uid)
        const sampleHookData = {topics: topics, uid: uid}

        const result = await library.anonymizeTopicsGet(sampleHookData);
        result.topics.forEach((topic) => {
            if (topic.tid == anonTopicData1.tid || topic.tid == anonTopicData2.tid) {
                assert.strictEqual(topic.uid, 0);
            }
            else {
                assert.strictEqual(topic.uid, uid);
            }
        })
    });
});

describe('anonymous toggle', function () {
    let submitHandler;

    before(function (done) {
        // Create DOM
        const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
            url: "http://localhost"
        });

        
        const jquery = require('jquery');
        const $ = jquery(dom.window);

        global.window = dom.window;
        global.document = dom.window.document;
        global.$ = $;
        global.window.$ = $;
        global.window.jQuery = $;

        // Mock window.app.require
        global.window.app = {
            require: () => Promise.resolve([{
                on: (event, handler) => {
                    if (event === 'filter:composer.submit') {
                        submitHandler = handler;
                    }
                }
            }])
        };

        // Load client file after mocking window
        require('../plugins/nodebb-plugin-anon-toggle/public/client');

        // Give time for Promise to resolve
        setTimeout(done, 10);
    });

    it('should set anonymous=true when toggle is checked', function () {
        const uuid = 'abc123';

        // Add fake composer DOM
        $('body').append(`
            <div class="composer" data-uuid="${uuid}">
                <input type="checkbox"
                       class="composer-anonymity-checkbox"
                       checked />
            </div>
        `);

        const submitHookData = {
            composerData: { uuid }
        };

        const result = submitHandler(submitHookData);

        assert.strictEqual(result.composerData.anonymous, true);
    });

    it('should set anonymous=false when toggle is not checked', function () {
        const uuid = 'xyz789';

        $('body').append(`
            <div class="composer" data-uuid="${uuid}">
                <input type="checkbox"
                       class="composer-anonymity-checkbox" />
            </div>
        `);

        const submitHookData = {
            composerData: { uuid }
        };

        const result = submitHandler(submitHookData);

        assert.strictEqual(result.composerData.anonymous, false);
    });
});
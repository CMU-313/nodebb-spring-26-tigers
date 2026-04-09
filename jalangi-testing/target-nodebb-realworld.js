// Realistic NodeBB-style code exercising patterns found throughout the codebase.
// Written in ES5-compatible syntax for Jalangi2 compatibility.

var EventEmitter = require('events');

// --- Simulated user/topic utilities (mirrors src/topics, src/user patterns) ---

var topicStore = {};
var userStore = {};
var nextId = 1;

function createUser(username, email) {
    if (!username || typeof username !== 'string') {
        return null;
    }
    var uid = nextId++;
    userStore[uid] = {
        uid: uid,
        username: username,
        email: email || '',
        reputation: 0,
        postcount: 0,
        joindate: Date.now()
    };
    return userStore[uid];
}

function getUserByUid(uid) {
    return userStore[uid] || null;
}

function createTopic(uid, title, content) {
    if (!getUserByUid(uid)) {
        throw new Error('User not found: ' + uid);
    }
    if (!title) {
        throw new Error('Title is required');
    }
    var tid = nextId++;
    topicStore[tid] = {
        tid: tid,
        uid: uid,
        title: title,
        content: content || '',
        timestamp: Date.now(),
        viewcount: 0,
        postcount: 1,
        votes: 0,
        deleted: false,
        locked: false,
        pinned: false,
        replies: []
    };

    var user = getUserByUid(uid);
    user.postcount++;
    return topicStore[tid];
}

function replyToTopic(tid, uid, content) {
    var topic = topicStore[tid];
    if (!topic) {
        throw new Error('Topic not found');
    }
    if (topic.locked) {
        throw new Error('Topic is locked');
    }
    var user = getUserByUid(uid);
    if (!user) {
        throw new Error('User not found');
    }
    var reply = {
        pid: nextId++,
        tid: tid,
        uid: uid,
        content: content,
        timestamp: Date.now(),
        votes: 0
    };
    topic.replies.push(reply);
    topic.postcount++;
    user.postcount++;
    return reply;
}

function voteTopic(tid, uid, direction) {
    var topic = topicStore[tid];
    if (!topic) return false;
    if (direction === 'up') {
        topic.votes++;
    } else if (direction === 'down') {
        topic.votes--;
    }
    return true;
}

function getTopicsByUser(uid) {
    var results = [];
    for (var tid in topicStore) {
        if (topicStore.hasOwnProperty(tid)) {
            if (topicStore[tid].uid === uid) {
                results.push(topicStore[tid]);
            }
        }
    }
    return results;
}

function searchTopics(query) {
    if (!query) return [];
    var lower = query.toLowerCase();
    var results = [];
    for (var tid in topicStore) {
        if (topicStore.hasOwnProperty(tid)) {
            var topic = topicStore[tid];
            if (topic.title.toLowerCase().indexOf(lower) !== -1 ||
                topic.content.toLowerCase().indexOf(lower) !== -1) {
                results.push(topic);
            }
        }
    }
    return results;
}

function paginateResults(items, page, perPage) {
    page = parseInt(page, 10) || 1;
    perPage = perPage || 20;
    var start = (page - 1) * perPage;
    var end = start + perPage;
    return {
        items: items.slice(start, end),
        total: items.length,
        page: page,
        pages: Math.ceil(items.length / perPage)
    };
}

// --- Event system (mirrors NodeBB plugin hooks) ---
var hooks = new EventEmitter();

hooks.on('action:topic.post', function (data) {
    console.log('[Hook] New topic posted: "' + data.topic.title + '" by user ' + data.topic.uid);
});

hooks.on('action:topic.reply', function (data) {
    console.log('[Hook] Reply to topic ' + data.reply.tid + ' by user ' + data.reply.uid);
});

// --- Run the simulation ---
console.log('=== NodeBB Simulation ===\n');

console.log('--- Creating Users ---');
var alice = createUser('alice', 'alice@example.com');
var bob = createUser('bob', 'bob@example.com');
var charlie = createUser('charlie');
var invalidUser = createUser(null);
var emptyUser = createUser('');
console.log('Created users: alice=' + alice.uid + ', bob=' + bob.uid + ', charlie=' + charlie.uid);
console.log('Invalid user result: ' + invalidUser);
console.log('Empty user result: ' + emptyUser);

console.log('\n--- Creating Topics ---');
var topic1 = createTopic(alice.uid, 'How to set up NodeBB?', 'I need help installing NodeBB on Ubuntu.');
hooks.emit('action:topic.post', { topic: topic1 });
var topic2 = createTopic(bob.uid, 'JavaScript best practices', 'Discussion about modern JS patterns.');
hooks.emit('action:topic.post', { topic: topic2 });
var topic3 = createTopic(alice.uid, 'NodeBB Plugin Development', 'Guide to building plugins for NodeBB.');
hooks.emit('action:topic.post', { topic: topic3 });

console.log('\n--- Replying to Topics ---');
var reply1 = replyToTopic(topic1.tid, bob.uid, 'Follow the official documentation!');
hooks.emit('action:topic.reply', { reply: reply1 });
var reply2 = replyToTopic(topic1.tid, charlie.uid, 'I had the same question.');
hooks.emit('action:topic.reply', { reply: reply2 });
var reply3 = replyToTopic(topic2.tid, alice.uid, 'I recommend using ESLint.');
hooks.emit('action:topic.reply', { reply: reply3 });

console.log('\n--- Voting ---');
voteTopic(topic1.tid, bob.uid, 'up');
voteTopic(topic1.tid, charlie.uid, 'up');
voteTopic(topic2.tid, alice.uid, 'up');
voteTopic(topic2.tid, charlie.uid, 'down');
console.log('Topic 1 votes: ' + topicStore[topic1.tid].votes);
console.log('Topic 2 votes: ' + topicStore[topic2.tid].votes);

console.log('\n--- Searching ---');
var searchResult1 = searchTopics('NodeBB');
console.log('Search "NodeBB": found ' + searchResult1.length + ' topics');
var searchResult2 = searchTopics('JavaScript');
console.log('Search "JavaScript": found ' + searchResult2.length + ' topics');
var searchResult3 = searchTopics('nonexistent');
console.log('Search "nonexistent": found ' + searchResult3.length + ' topics');

console.log('\n--- Pagination ---');
var allTopics = [];
for (var tid in topicStore) {
    if (topicStore.hasOwnProperty(tid)) {
        allTopics.push(topicStore[tid]);
    }
}
var page1 = paginateResults(allTopics, 1, 2);
console.log('Page 1: ' + page1.items.length + ' items, total pages: ' + page1.pages);
var page2 = paginateResults(allTopics, 2, 2);
console.log('Page 2: ' + page2.items.length + ' items');

console.log('\n--- User Stats ---');
var aliceTopics = getTopicsByUser(alice.uid);
console.log('Alice has ' + aliceTopics.length + ' topics, ' + alice.postcount + ' posts');
console.log('Bob has ' + bob.postcount + ' posts');
console.log('Charlie has ' + charlie.postcount + ' posts');

console.log('\n=== Simulation Complete ===');

'use strict';

// This plugin adds a toggle to the post composer to allow users to post anonymously. When enabled, it scrubs user information from the post data before it's sent to the client.
exports.addScripts = async function (scripts) {
    //Absolute path to ensure it works regardless of where the plugin is located
    scripts.push('/assets/plugins/nodebb-plugin-anon-toggle/static/client.js');
    return scripts;
};

// Helper function to determine if a value should be treated as "anonymous"
function isAnonValue(v) {
    return v === true || v === 1 || v === '1' || v === 'true';
}

// Scrub user data from an object if it's marked as anonymous
function scrubUser(obj) {
    // Only scrub if the post is marked as anonymous
    if (!obj || !isAnonValue(obj.anonymous)) return;
    obj.uid = 0;
}

//Handle single post retrieval
exports.anonymizePostGet = async function (hookData) {
    if (hookData && hookData.post) {
        scrubUser(hookData.post);
    }
    return hookData;
};

//Handle multiple posts retrieval
exports.anonymizePostsGet = async function (hookData) {
    if (hookData && Array.isArray(hookData.posts)) {
        hookData.posts.forEach(scrubUser);
    }
    return hookData;
};

//Handle single topic retrieval
exports.anonymizeTopicGet = async function (hookData) {
    if (hookData && hookData.topic) {
        scrubUser(hookData.topic);
    }
    return hookData;
};

//Handle multiple topic retrieval
exports.anonymizeTopicsGet = async function (hookData) {
    if (hookData && Array.isArray(hookData.topics)) {
        hookData.topics.forEach(scrubUser);
    }
    return hookData;
};

exports.test = async function (hookData) {
    console.log("test", hookData);
    return hookData;
};
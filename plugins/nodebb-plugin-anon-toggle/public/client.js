'use strict';
/* global $, window */

const helpers = require('plugins/nodebb-plugin-anon-toggle/public/helpers.js')

(function () {

    //Attach submit hooks as soon as the script loads
    helpers.attachSubmitHook();

    //Inject toggle when composer loads for topics and replys
    $(window).on('action:composer.loaded', function (event, data) {
        const postContainer = data && data.postContainer;
        const post_uuid = data && data.post_uuid;
        helpers.injectToggle(postContainer, post_uuid);
    });
})();
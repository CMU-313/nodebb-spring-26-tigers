'use strict';
/* global $, window */

(function (exports) {
    //Attach submit hooks as soon as the script loads
    attachSubmitHook();

    function injectToggle(postContainer, post_uuid) {
        //Make sure composer exists
        if (!postContainer || !postContainer.length) return;
        //Ensure no duplicates
        if (postContainer.find('.composer-anonymity-toggle').length) return;

        const switchId = `composer-anon-switch-${post_uuid || Date.now()}`;
        const html = `
            <div class="composer-anonymity-toggle">
                <div class="form-check form-switch">
                <input class="form-check-input composer-anonymity-checkbox" type="checkbox" role="switch" id="${switchId}">
                <label class="form-check-label" for="${switchId}">Post anonymously</label>
             </div>
            </div>
        `;

        //Insert right above the text area
        const $write = postContainer.find('textarea, .write').first();
        if ($write.length) $write.before(html);
        else postContainer.prepend(html); //Fallback

        //Store value when toggle changes
        postContainer.off('change', '.composer-anonymity-checkbox');
        postContainer.on('change', '.composer-anonymity-checkbox', function () {
            postContainer.data('isAnonymous', $(this).is(':checked'));
        });
    }

    //Attach hooks to composer submit to include anonymity data
    function attachSubmitHook() {
        //Prevent multiple attachments (in case of multiple composer loads)
        if (window.__anonToggleSubmitHookAttached) return;

        //Wait for app and hooks to be available
        if (!window.app || typeof window.app.require !== 'function') {
            setTimeout(attachSubmitHook, 250);
            return;
        }

        //Attach to the submit hook to include the anonymity state in the composer data
        window.app.require(['hooks'])
            .then(([hooks]) => {
                window.__anonToggleSubmitHookAttached = true;

                hooks.on('filter:composer.submit', function (submitHookData) {
                    const uuid = submitHookData?.composerData?.uuid;
                    const $composer = uuid ? $(`.composer[data-uuid="${uuid}"]`) : submitHookData?.composerEl;

                    //Read checkbox state
                    const checked = ($composer && $composer.length)
                        ? $composer.find('.composer-anonymity-checkbox').is(':checked')
                        : false;

                    //Store in composer data for server-side processing
                    if (submitHookData && submitHookData.composerData) {
                        submitHookData.composerData.anonymous = checked;
                    }

                    return submitHookData;
                });
            })
            .catch(err => {
                console.error('[anon-toggle] Failed to attach submit hook:', err);
            });
    }
        
    //Inject toggle when composer loads for topics and replys
    $(window).on('action:composer.loaded', function (event, data) {
        const postContainer = data && data.postContainer;
        const post_uuid = data && data.post_uuid;
        injectToggle(postContainer, post_uuid);
    });
    
    //for testing purposes
    if (typeof module !== 'undefined' && module.exports) {
        exports.injectToggle = injectToggle;
        exports.attachSubmitHook = attachSubmitHook;
    }
})(typeof exports === 'undefined' ? this['anonToggle']={} : exports);
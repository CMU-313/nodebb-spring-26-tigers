'use strict';
/* global $, window */

(function () {
  console.log('[anon-toggle] static client loaded');

  function injectToggle(postContainer, post_uuid) {
    if (!postContainer || !postContainer.length) return;
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

    const $write = postContainer.find('textarea, .write').first();
    if ($write.length) $write.before(html);
    else postContainer.prepend(html);

    postContainer.off('change', '.composer-anonymity-checkbox');
    postContainer.on('change', '.composer-anonymity-checkbox', function () {
      postContainer.data('isAnonymous', $(this).is(':checked'));
    });
  }

  function attachSubmitHook() {
    if (!window.app || typeof window.app.require !== 'function') {
      setTimeout(attachSubmitHook, 250);
      return;
    }

    window.app.require(['hooks'], function (hooks) {
      console.log('[anon-toggle] hooks loaded, attaching submit filter');

      hooks.on('filter:composer.submit', function (submitHookData, next) {
        try {
          const uuid = submitHookData?.composerData?.uuid;
          const $composer = uuid ? $(`.composer[data-uuid="${uuid}"]`) : submitHookData?.composerEl;
      
          const checked =
            $composer && $composer.length
              ? $composer.find('.composer-anonymity-checkbox').is(':checked')
              : false;
      
          if (submitHookData && submitHookData.composerData) {
            submitHookData.composerData.anonymous = checked;
          }
      
          next(null, submitHookData);
        } catch (err) {
          next(err);
        }
      });
    });
  }
  attachSubmitHook();

  $(window).on('action:composer.loaded', function (event, data) {
    console.log('[anon-toggle] action:composer.loaded', data);
    const postContainer = data && data.postContainer;
    const post_uuid = data && data.post_uuid;
    injectToggle(postContainer, post_uuid);
  });
})();
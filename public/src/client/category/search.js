"use strict";

define('forum/category/search', [], function () {
    const CategorySearch = {};

    CategorySearch.init = function () {
        $(document).on('submit', '.topic-list-header form[action$="/search"]', function (e) {
            e.preventDefault();
            const $form = $(this);
            const term = $form.find('input[name="term"]').val() || '';
            const cid = $form.find('input[name="categories"]').val() || '';
            const params = [];
            if (term) {
                params.push('term=' + encodeURIComponent(term));
            }
            if (cid) {
                params.push('categories=' + encodeURIComponent(cid));
            }
            const url = '/search' + (params.length ? ('?' + params.join('&')) : '');
            // Use ajaxify navigation to keep SPA behavior
            if (typeof ajaxify !== 'undefined' && ajaxify.go) {
                ajaxify.go(url);
            } else {
                window.location.href = url;
            }
        });
    };

    return CategorySearch;
});

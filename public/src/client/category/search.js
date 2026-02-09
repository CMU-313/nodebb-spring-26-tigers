"use strict";

define('forum/category/search', ['utils'], function (utils) {
	const CategorySearch = {};

	CategorySearch.init = function () {
		let $input = $('#topic-search');
		// If the active theme doesn't include the search input in templates,
		// inject it next to the New Topic button so it works across themes.
		if (!$input.length) {
			const $newTopic = $('#new_topic, [component="category/post"]').first();
			if ($newTopic && $newTopic.length) {
				const $wrapper = $('<div class="me-2 d-flex align-items-center"></div>');
				const $group = $(
					'<div class="input-group input-group-sm">' +
					'<input type="search" id="topic-search" class="form-control form-control-sm" placeholder="Search topics..." aria-label="Search topics" />' +
					'<span class="input-group-text"><i class="fa fa-search"></i></span>' +
					'</div>'
				);
				$wrapper.append($group);
				$wrapper.insertBefore($newTopic);
				$input = $('#topic-search');
			}
		}
		if (!$input || !$input.length) {
			return;
		}

		const doFilter = utils.debounce(function () {
			const q = $input.val().trim().toLowerCase();
			const $topics = $('[component="category/topic"]');
			if (!q) {
				$topics.show();
				return;
			}

			$topics.each(function () {
				const $t = $(this);
				const title = ($t.find('[component="topic/header"] a').text() || '').toLowerCase();
				if (title.indexOf(q) === -1) {
					$t.hide();
				} else {
					$t.show();
				}
			});
		}, 200);

		$input.on('input', doFilter);
	};

	return CategorySearch;
});

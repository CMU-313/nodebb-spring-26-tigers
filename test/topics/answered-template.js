'use strict';

const assert = require('assert');

describe('answered badge template rendering', () => {
	function renderBadges(data) {
		return {
			answered: `<span component="topic/answered" class="badge border border-success text-success ${data.answered ? '' : 'hidden'}">`,
			notAnswered: `<span component="topic/not-answered" class="badge border border-danger text-danger ${data.notAnswered ? '' : 'hidden'}>`,
		};
	}

	it('should hide answered badge when answered=0', () => {
		const { answered } = renderBadges({ answered: 0, notAnswered: 0 });
		assert(answered.includes('hidden'), 'answered badge should be hidden');
	});

	it('should show answered badge when answered=1', () => {
		const { answered } = renderBadges({ answered: 1, notAnswered: 0 });
		assert(!answered.includes('hidden'), 'answered badge should not be hidden');
	});

	it('should show not-answered badge when notAnswered=1', () => {
		const { notAnswered } = renderBadges({ answered: 0, notAnswered: 1 });
		assert(!notAnswered.includes('hidden'), 'not-answered badge should not be hidden');
	});

	it('should hide not-answered badge when notAnswered=0', () => {
		const { notAnswered } = renderBadges({ answered: 0, notAnswered: 0 });
		assert(notAnswered.includes('hidden'), 'not-answered badge should be hidden');
	});

	it('should hide both badges when neither answered nor notAnswered', () => {
		const { answered, notAnswered } = renderBadges({ answered: 0, notAnswered: 0 });
		assert(answered.includes('hidden'), 'answered badge should be hidden');
		assert(notAnswered.includes('hidden'), 'not-answered badge should be hidden');
	});
});
'use strict';

const assert = require('assert');
const benchpress = require('../../node_modules/benchpressjs');

describe('answered badge template rendering', () => {
	const templateSource = `
        <span component="topic/answered" class="badge border border-success text-success {{{ if !answered }}}hidden{{{ end }}}">
            <i class="fa fa-check-circle"></i> Answered
        </span>
        <span component="topic/not-answered" class="badge border border-danger text-danger {{{ if !notAnswered }}}hidden{{{ end }}}">
            <i class="fa fa-times-circle"></i> Not Answered
        </span>
    `;

	it('should hide answered badge when answered=0', async () => {
		const rendered = await benchpress.render(templateSource, { answered: 0, notAnswered: 0 });
		const answeredSpan = rendered.match(/<span component="topic\/answered"[^>]*>/)[0];
		assert(answeredSpan.includes('hidden'), 'answered badge should be hidden');
	});

	it('should show answered badge when answered=1', async () => {
		const rendered = await benchpress.render(templateSource, { answered: 1, notAnswered: 0 });
		const answeredSpan = rendered.match(/<span component="topic\/answered"[^>]*>/)[0];
		assert(!answeredSpan.includes('hidden'), 'answered badge should not be hidden');
	});

	it('should show not-answered badge when notAnswered=1', async () => {
		const rendered = await benchpress.render(templateSource, { answered: 0, notAnswered: 1 });
		const notAnsweredSpan = rendered.match(/<span component="topic\/not-answered"[^>]*>/)[0];
		assert(!notAnsweredSpan.includes('hidden'), 'not-answered badge should not be hidden');
	});

	it('should hide not-answered badge when notAnswered=0', async () => {
		const rendered = await benchpress.render(templateSource, { answered: 0, notAnswered: 0 });
		const notAnsweredSpan = rendered.match(/<span component="topic\/not-answered"[^>]*>/)[0];
		assert(notAnsweredSpan.includes('hidden'), 'not-answered badge should be hidden');
	});

	it('should hide both badges when neither answered nor notAnswered', async () => {
		const rendered = await benchpress.render(templateSource, { answered: 0, notAnswered: 0 });
		const answeredSpan = rendered.match(/<span component="topic\/answered"[^>]*>/)[0];
		const notAnsweredSpan = rendered.match(/<span component="topic\/not-answered"[^>]*>/)[0];
		assert(answeredSpan.includes('hidden'), 'answered badge should be hidden');
		assert(notAnsweredSpan.includes('hidden'), 'not-answered badge should be hidden');
	});
});
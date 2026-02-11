'use strict';

const privileges = require('../privileges');
const plugins = require('../plugins');

module.exports = function (Posts) {
	Posts.tools = {};

	Posts.tools.delete = async function (uid, pid) {
		return await togglePostDelete(uid, pid, true);
	};

	Posts.tools.restore = async function (uid, pid) {
		return await togglePostDelete(uid, pid, false);
	};

	async function togglePostDelete(uid, pid, isDelete) {
		const [postData, canDelete] = await Promise.all([
			Posts.getPostData(pid),
			privileges.posts.canDelete(pid, uid),
		]);
		if (!postData) {
			throw new Error('[[error:no-post]]');
		}

		if (postData.deleted && isDelete) {
			throw new Error('[[error:post-already-deleted]]');
		} else if (!postData.deleted && !isDelete) {
			throw new Error('[[error:post-already-restored]]');
		}

		if (!canDelete.flag) {
			throw new Error(canDelete.message);
		}
		let post;
		if (isDelete) {
			Posts.clearCachedPost(pid);
			post = await Posts.delete(pid, uid);
		} else {
			post = await Posts.restore(pid, uid);
			post = await Posts.parsePost(post);
		}
		return post;
	}

	Posts.tools.markAsQuestion = async function (uid, pid) {
		return await togglePostQuestion(uid, pid, true);
	};

	Posts.tools.unmarkAsQuestion = async function (uid, pid) {
		return await togglePostQuestion(uid, pid, false);
	};

	async function togglePostQuestion(uid, pid, isQuestion) {
		const postData = await Posts.getPostData(pid);
		if (!postData) {
			throw new Error('[[error:no-post]]');
		}

		const canEdit = await privileges.posts.canEdit(pid, uid);
		if (!canEdit.flag) {
			throw new Error(canEdit.message);
		}

		const promises = [
			Posts.setPostField(pid, 'isQuestion', isQuestion ? 1 : 0),
		];

		// When unmarking as question, also clear answered status
		if (!isQuestion) {
			promises.push(Posts.setPostField(pid, 'answered', 0));
		}

		await Promise.all(promises);

		postData.isQuestion = isQuestion;
		if (!isQuestion) {
			postData.answered = 0;
		}

		plugins.hooks.fire('action:post.question', { post: postData, uid });
		return postData;
	}

	Posts.tools.markAnswered = async function (uid, pid) {
		return await togglePostAnswered(uid, pid, true);
	};

	Posts.tools.markUnanswered = async function (uid, pid) {
		return await togglePostAnswered(uid, pid, false);
	};

	async function togglePostAnswered(uid, pid, answered) {
		const postData = await Posts.getPostData(pid);
		if (!postData) {
			throw new Error('[[error:no-post]]');
		}

		const canEdit = await privileges.posts.canEdit(pid, uid);
		if (!canEdit.flag) {
			throw new Error(canEdit.message);
		}

		await Posts.setPostField(pid, 'answered', answered ? 1 : 0);
		postData.answered = answered;

		plugins.hooks.fire('action:post.answered', { post: postData, uid });
		return postData;
	}
};


/* eslint-disable strict */

const translatorApi = module.exports;

const TRANSLATOR_API = process.env.TRANSLATOR_API || 'http://localhost:5000';

translatorApi.translate = async function (postData) {
	try {
		const response = await fetch(
			`${TRANSLATOR_API}/?content=${encodeURIComponent(postData.content)}`
		);
		const data = await response.json();
		return [data.is_english, data.translated_content];
	} catch (err) {
		console.error('[translator] Error calling translator service:', err.message, err.constructor.name);
		return [true, postData.content];
	}
};

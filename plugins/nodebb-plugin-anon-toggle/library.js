'use strict';

exports.addScripts = async function (scripts) {
  scripts.push('/assets/plugins/nodebb-plugin-anon-toggle/static/client.js');
  return scripts;
};

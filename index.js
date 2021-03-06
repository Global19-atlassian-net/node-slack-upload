/**
 * Module dependencies.
 */
var request = require('request');
var _ = require('lodash');
_.mixin(require('underscore.string').exports());
var util = require('util');

/**
 * Create an object with slack configuration
 * @param {String} token Slack web api token
 * @constructor
 */
function Slack(token) {
	this.token = token;
	this.api = 'https://slack.com/api/';
}

/**
 * Upload file to slack
 * @see https://api.slack.com/methods/files.upload
 * @param {Object} data files.upload input as camelcase json (file should be a stream)
 * @param callback Callback function (err)
 */
Slack.prototype.uploadFile = function (data, callback) {
	var file;
	if (data.file) {
		file = data.file;
		data = _.omit(data, 'file');
	}
	var params = _.reduce(data, function (res, value, key) {
		return util.format('%s&%s=%s', res, _.underscored(key), value);
	}, '');
	var endpoint = util.format('%sfiles.upload?token=%s%s', this.api, this.token, params);
	var req = request.post(endpoint, function (err, response, body) {
		if (err) {
			return callback(err);
		}
		if (response.statusCode >= 300) {
			return callback(response);
		}
		body = JSON.parse(body);
		if (!body.ok) {
			return callback(body.error);
		}
		callback();
	});
	if (file) {
		var form = req.form();
		form.append('file', file);
	}
};

module.exports = Slack;
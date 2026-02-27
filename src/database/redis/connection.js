'use strict';

const nconf = require('nconf');
const { createClient, createCluster, createSentinel } = require('redis');
const winston = require('winston');

const connection = module.exports;

connection.connect = async function (options) {
	return new Promise((resolve, reject) => {
		options = options || nconf.get('redis');
		const redis_socket_or_host = options.host;

		let cxn;
		if (options.cluster) {
			const rootNodes = options.cluster.map(node => ({ url : `redis://${node.host}:${node.port}` }));
			cxn = createCluster({
				...options.options,
				rootNodes: rootNodes,
			});
		} else if (options.sentinels) {
			const sentinelRootNodes = options.sentinels.map(sentinel => ({ host: sentinel.host, port: sentinel.port }));
			cxn = createSentinel({
				...options.options,
				sentinelRootNodes,
			});
		} else if (redis_socket_or_host && String(redis_socket_or_host).indexOf('/') >= 0) {
			// If redis.host contains a path name character, use the unix dom sock connection. ie, /tmp/redis.sock
			cxn = createClient({
				...options.options,
				password: options.password,
				database: options.database,
				socket: {
					path: redis_socket_or_host,
					reconnectStrategy: 3000,
				},
			});
		} else {
			// Else, connect over tcp/ip
			cxn = createClient({
				...options.options,
				password: options.password,
				database: options.database,
				socket: {
					host: redis_socket_or_host,
					port: options.port,
					reconnectStrategy: 3000,
				},
			});
		}

		const dbIdx = parseInt(options.database, 10);
		if (!(dbIdx >= 0)) {
			throw new Error('[[error:no-database-selected]]');
		}

		cxn.on('error', (err) => {
			winston.error(err.stack);
			reject(err);
		});

		cxn.connect().then(() => {
			// back-compat with node_redis
			const _multi = cxn.multi.bind(cxn);
			cxn.batch = cxn.multi = function (cmds) {
				const pipeline = _multi();
				// Old API: multi([['command', ...args], ...])
				// Translates old lowercase/changed commands to redis v5 API
				if (Array.isArray(cmds)) {
					for (const [cmd, ...args] of cmds) {
						const upperCmd = cmd.toUpperCase();
						if (upperCmd === 'ZADD') {
							// Old: zadd key score member → New: ZADD key {score, value}
							pipeline.ZADD(args[0], { score: Number(args[1]), value: String(args[2]) });
						} else if (upperCmd === 'ZINTERSTORE' || upperCmd === 'ZUNIONSTORE') {
							// Old: zinterstore dest numkeys key1 key2 → New: ZINTERSTORE dest [key1, key2]
							pipeline[upperCmd](args[0], args.slice(2, 2 + Number(args[1])));
						} else if (upperCmd === 'ZREVRANGE') {
							// Removed in redis v4+; replaced by ZRANGE with REV option
							pipeline.ZRANGE(args[0], args[1], args[2], { REV: true });
						} else if (typeof pipeline[upperCmd] === 'function') {
							pipeline[upperCmd](...args);
						}
					}
				}
				// Add lowercase aliases for old-style chained usage (e.g. multi().zrem(...))
				pipeline.zrem = (...args) => pipeline.ZREM(...args);
				// Make exec() accept an optional callback
				const _exec = pipeline.exec.bind(pipeline);
				pipeline.exec = function (callback) {
					if (typeof callback === 'function') {
						_exec().then(r => callback(null, r)).catch(callback);
					} else {
						return _exec();
					}
				};
				return pipeline;
			};
			//winston.info('Connected to Redis successfully');
			resolve(cxn);
		}).catch((err) => {
			winston.error('Error connecting to Redis:', err);
		});
	});
};

require('../../promisify')(connection);

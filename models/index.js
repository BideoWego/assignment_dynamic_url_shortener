const bluebird = require('bluebird');
const redis = require('async-redis');
const client = redis.createClient({ port: process.env.REDIS_PORT || 6379 });


client.on('error', err => console.error(err));


const createRedisHelpers = (modelName, redis) => {
  const toKey = id => `${ modelName }:${ id }`;

  const nextIdKey = `nextIds:${ modelName }`;
  const nextIdGet = async () => {
    const exists = await redis.exists(nextIdKey);
    let id = 0;
    if (exists) {
      id = await redis.get(nextIdKey);
    }
    return ++id;
  };

  const nextIdSet = async () => {
    let id = await nextIdGet();
    await redis.set(nextIdKey, id);
    id = await redis.get(nextIdKey);
    return id;
  };

  const nextKeyGet = async () => {
    const id = await nextIdGet();
    return toKey(id);
  };

  return {
    key: modelName,
    toKey,
    next: {
      id: { get: nextIdGet, set: nextIdSet },
      key: { get: nextKeyGet }
    }
  };
};


const URL = require('./url')(client, createRedisHelpers('urls', client));
const Click = require('./click')(client, createRedisHelpers('clicks', client));


module.exports = {
  redis: client,
  URL,
  Click
};





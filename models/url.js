const shortid = require('shortid');


module.exports = (redis, helpers) => {


  const URL = { helpers };


  URL.create = async ({ url }) => {
    try {
      const id = await helpers.next.id.get();
      const key = await helpers.next.key.get();
      const shortUrl = shortid.generate();
      const createdAt = new Date().toISOString();

      const options = { id, url, shortUrl, createdAt };

      await redis.hmset(key, options);
      const result = await redis.hgetall(key);
      await helpers.next.id.set();
      return result;
    } catch (e) {
      throw e;
    }
  };


  URL.find = async id => {
    try {
      const key = helpers.toKey(id);
      return await redis.hgetall(key);
    } catch (e) {
      throw e;
    }
  };


  URL.all = async () => {
    try {
      const key = helpers.key;
      const keys = await redis.keys(`${ key }:*`);
      const results = keys.map(async key => await redis.hgetall(key));
      return await Promise.all(results);
    } catch (e) {
      throw e;
    }
  };


  return URL;
};













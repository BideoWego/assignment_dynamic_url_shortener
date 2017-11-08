const shortid = require('shortid');


module.exports = (redis, helpers, ShortURL) => {


  const URL = { helpers };


  URL.create = async ({ url }) => {
    const id = await helpers.next.id.get();
    const key = await helpers.next.key.get();
    const shortUrl = shortid.generate();
    const createdAt = new Date().toISOString();

    const options = { id, url, shortUrl, createdAt };

    await redis.hmset(key, options);
    const result = await redis.hgetall(key);
    await helpers.next.id.set();
    await ShortURL.create({ shortUrl, urlId: result.id });
    return result;
  };


  URL.find = async id => {
    const key = helpers.toKey(id);
    return await redis.hgetall(key);
  };


  URL.findByShortUrl = async shortUrl => {
    shortUrl = await ShortURL.find(shortUrl);
    const id = shortUrl.urlId;
    return await URL.find(id);
  };


  URL.all = async () => {
    const key = helpers.key;
    const keys = await redis.keys(`${ key }:*`);
    const results = keys.map(async key => await redis.hgetall(key));
    return await Promise.all(results);
  };


  return URL;
};













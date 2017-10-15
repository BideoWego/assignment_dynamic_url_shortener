

module.exports = (redis, helpers) => {


  const Click = { helpers };


  Click.create = async ({ urlId, referrer }) => {
    try {
      const id = await helpers.next.id.get();
      const key = await helpers.next.key.get();
      const createdAt = new Date().toISOString();

      const options = { id, referrer, urlId, createdAt };

      await redis.hmset(key, options);
      const result = await redis.hgetall(key);
      await helpers.next.id.set();
      return result;
    } catch (e) {
      throw e;
    }
  };


  Click.find = async id => {
    try {
      const key = helpers.toKey(id);
      return await redis.hgetall(key);
    } catch (e) {
      throw e;
    }
  };


  Click.findByUrlId = async urlId => {
    const clicks = await Click.all();
    return clicks.filter(click => click.urlId == urlId);
  };


  Click.all = async () => {
    try {
      const key = helpers.key;
      const keys = await redis.keys(`${ key }:*`);
      const results = keys.map(async key => await redis.hgetall(key));
      return await Promise.all(results);
    } catch (e) {
      throw e;
    }
  };


  return Click;
};













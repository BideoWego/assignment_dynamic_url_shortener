

module.exports = (redis, helpers) => {


  const Click = { helpers };


  Click.create = async ({ urlId, referrer }) => {
    const id = await helpers.next.id.get();
    const key = await helpers.next.key.get();
    const createdAt = new Date().toISOString();

    const options = { id, referrer, urlId, createdAt };

    await redis.hmset(key, options);
    const result = await redis.hgetall(key);
    await helpers.next.id.set();
    return result;
  };


  Click.find = async id => {
    const key = helpers.toKey(id);
    return await redis.hgetall(key);
  };


  Click.findByUrlId = async urlId => {
    const clicks = await Click.all();
    return clicks.filter(click => click.urlId == urlId);
  };


  Click.all = async () => {
    const key = helpers.key;
    const keys = await redis.keys(`${ key }:*`);
    const results = keys.map(async key => await redis.hgetall(key));
    return await Promise.all(results);
  };


  return Click;
};













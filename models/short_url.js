

module.exports = redis => {


  const ShortURL = {};


  ShortURL.create = async ({ shortUrl, urlId }) => {
    await redis.set(shortUrl, urlId);
    return { shortUrl, urlId };
  };


  ShortURL.find = async shortUrl => {
    const urlId = await redis.get(shortUrl);
    return { shortUrl, urlId };
  };


  return ShortURL;
};








const express = require('express');
const app = express();
app.locals.appName = 'Dynamic URL Shortener';


// ----------------------------------------
// Socket.io
// ----------------------------------------
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use('/socket.io', express.static(
 `${ __dirname }/node_modules/socket.io-client/dist/`
));


// ----------------------------------------
// ENV
// ----------------------------------------
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


// ----------------------------------------
// Body Parser
// ----------------------------------------
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ----------------------------------------
// Sessions/Cookies
// ----------------------------------------
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['asdf1234567890qwer']
}));

app.use((req, res, next) => {
  app.locals.session = req.session;
  next();
});


// ----------------------------------------
// Flash Messages
// ----------------------------------------
const flash = require('express-flash-messages');
app.use(flash());


// ----------------------------------------
// Method Override
// ----------------------------------------
const methodOverride = require('method-override');
const getPostSupport = require('express-method-override-get-post-support');


app.use(methodOverride(
  getPostSupport.callback,
  getPostSupport.options // { methods: ['POST', 'GET'] }
));


// ----------------------------------------
// Referrer
// ----------------------------------------
app.use((req, res, next) => {
  req.session.backUrl = req.header('Referer') || '/';
  next();
});


// ----------------------------------------
// Public
// ----------------------------------------
app.use(express.static(`${__dirname}/public`));


// ----------------------------------------
// Logging
// ----------------------------------------
const morgan = require('morgan');
const morganToolkit = require('morgan-toolkit')(morgan);

app.use(morganToolkit());


// ----------------------------------------
// Models
// ----------------------------------------
const models = require('./models');
const {
  URL,
  Click
} = models;


// ----------------------------------------
// Routes
// ----------------------------------------
app.get('/', async (req, res, next) => {
  try {
    const urls = await URL.all();

    urls.forEach(async url => {
      url.clicks = await Click.findByUrlId(url.id);
    });

    res.render('urls/index', { urls });
  } catch (e) {
    next(e);
  }
});


app.get('/:shortUrl', async (req, res, next) => {
  try {
    const shortUrl = req.params.shortUrl;
    const url = await URL.findByShortUrl(shortUrl);

    await Click.create({
      urlId: url.id,
      referrer: req.session.backUrl
    });

    const clicks = await Click.findByUrlId(url.id);
    io.sockets.emit('click', url.id, clicks.length);

    res.redirect(url.url);
  } catch (e) {
    next(e);
  }
});


app.get('/urls/:id', async (req, res, next) => {
  try {
    const url = await URL.find(req.params.id);
    const clicks = await Click.findByUrlId(url.id);

    res.render('urls/show', { url, clicks });
  } catch (e) {
    next(e);
  }
});


app.post('/urls', async (req, res, next) => {
  try {
    await URL.create({ url: req.body.url });
    res.redirect('/');
  } catch (e) {
    next(e);
  }
});



// ----------------------------------------
// Template Engine
// ----------------------------------------
const expressHandlebars = require('express-handlebars');
 const helpers = require('./helpers');


const hbs = expressHandlebars.create({
  helpers: helpers,
  partialsDir: 'views/',
  defaultLayout: 'application'
});


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


// ----------------------------------------
// Server
// ----------------------------------------
const port = process.env.PORT ||
  process.argv[2] ||
  3000;
const host = 'localhost';


let args;
process.env.NODE_ENV === 'production' ?
  args = [port] :
  args = [port, host];

args.push(() => {
  console.log(`Listening: http://${ host }:${ port }\n`);
});

if (require.main === module) {
  app.locals.baseUrl = `http://${ host }:${ port }`;
  server.listen.apply(server, args);
}


// ----------------------------------------
// Error Handling
// ----------------------------------------
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.stack) {
    err = err.stack;
  }
  res.status(500).render('errors/500', { error: err });
});


module.exports = app;
















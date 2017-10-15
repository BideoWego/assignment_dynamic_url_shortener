require('dotenv').config();
const moment = require('moment');
const repl = require('repl').start({});
const models = require('./models');


repl.context.models = models;
repl.context.moment = moment;
for (let model in models) {
  repl.context[model] = models[model];
}
repl.context.lg = (...args) => console.log(...args);




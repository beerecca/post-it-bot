const PostItBot = require('./src/post-it-bot');
const dotenv = require('dotenv');
const R = require('ramda');

dotenv.load({silent: true});

PostItBot.start({
  services: R.map(require, [
    './src/services/botkit'
  ]),
  plugins: R.map(require, [
    './src/plugins/post-it',
    './src/plugins/ping'
  ])
});

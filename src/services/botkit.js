const Botkit = require('botkit');
const express = require('express');
const path = require('path');
const morgan = require('morgan');

module.exports = function(addService) {

  const PORT = process.env.BOT_PORT;
  const ENDPOINT_PREFIX = path.resolve(process.env.BOT_WEB_PREFIX || '/');

  const controller = initController();
  addService('controller', controller);

  const bot = spawnBot(controller);
  addService('bot', bot);

  const router = startWebserver(controller, PORT, ENDPOINT_PREFIX);
  addService('router', router);

};

function initController() {
  return Botkit.slackbot({
    debug: process.env.BOT_DEBUG || false
  });
}

function spawnBot(controller) {
  const slackToken = process.env.BOT_SLACK_TOKEN;
  if (!slackToken) {
    throw new Error('Error: Slack Token not set in environment.')
  }
  const bot = controller.spawn({
    token: slackToken
  });
  bot.startRTM((err) => {
    if (err) {
      throw new Error('Failed to connect to Slack API:', err);
    }
  });
  return bot;
}

function startWebserver(controller, port, endpointRoutePrefix) {
  controller.setupWebserver(port, function(err) {
    if (err) {
      throw new Error('Webserver start setup failed', err);
    }
  });
  const router = express.Router();
  controller.webserver.use(endpointRoutePrefix, router);
  router.use(morgan('combined'));
  return router;
}

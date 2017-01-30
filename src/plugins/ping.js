
module.exports = function init(PostItBot) {
  PostItBot.services.controller.hears('ping', ['direct_message,direct_mention,mention'], (bot, message) => {
    bot.reply(message, 'pong!');
  });
};

const PostIt = require('./post-it');

module.exports = function init(PostItBot) {

  PostItBot.services.controller.on('file_shared', (bot, message) => {
    const postIt = new PostIt();
    const postItChannel = process.env.BOT_SLACK_CHANNEL_ID;
    message.channel = postItChannel;

    postIt.getFileFromId(message.file_id)
      .then(file => {
        if (file.channel !== postItChannel) return;

        return postIt.getImageFile(file.thumb)
          .then(postIt.getBase64Image)
          .then(postIt.getTextFromImage)
          .then(description => postIt.createJiraTicket(file.projectId, description))
          .then(jiraLink => bot.reply(message, `New issue created here: ${jiraLink}`));
      })
      .catch((err) => {
        bot.reply(message, `Error: ${err.message}`);
      });
  });

};

# Post-It to JIRA Slack Bot

This bot is based on the [howdyai/botkit](https://github.com/howdyai/botkit) library.

## Create environment variables

Create a [bot integration](https://my.slack.com/services/new/bot) in your Slack team. Copy the api token that is assigned to your integration. Create a new channel that you want to use for your bot. Get the id by inspecting the channel name in the sidebar and getting the value of the data-channel-id attribute.

Create a [Google Cloud Platform account](https://cloud.google.com/vision/) and then add a new project to get your api token for the optical character recognition service.

Create an integration user in your JIRA site and [base64 encode](https://developer.atlassian.com/jiradev/jira-apis/jira-rest-apis/jira-rest-api-tutorials/jira-rest-api-example-basic-authentication) the username and password to create the Jira api token. [Get the ids](https://confluence.atlassian.com/jirakb/how-to-get-project-id-from-the-jira-user-interface-827341414.html) for the projects you want to assign issues to.

## Setup
Ensure you have [yarn](https://yarnpkg.com/en/docs/install) installed.

- Clone this repo
- Copy `.env.example` file in this repo to `.env` and paste in the environment variables
- Run `yarn`
- Run `yarn start`

## Using the bot
Invite your bot into the slack channel you want to use it with by typing `/invite @<my bot>`.

Use the slack mobile app to upload a photo of your post-it into that channel, adding a title with the key of the JIRA project you want to assign the task to.

The bot will respond with a link to the newly created issue.
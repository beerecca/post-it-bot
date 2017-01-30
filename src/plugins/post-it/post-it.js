const fetch = require('node-fetch');
const _ = require('lodash');
const jira = require('./jira');

const ENDPOINTS = {
  slack: 'https://slack.com/api/files.info',
  google: 'https://vision.googleapis.com/v1/images:annotate',
  jira: process.env.BOT_JIRA_URL + '/rest/api/2/issue',
  jiraLink: process.env.BOT_JIRA_URL + '/browse/'
};

class PostIt {

  getFileFromId(id) {
    return PostIt.fetch(`${ENDPOINTS.slack}?token=${process.env.BOT_SLACK_TOKEN}&file=${id}`, {
      method: 'GET'
    }).then(res => {
      return res.json();
    }).then(json => {
      if (!json.ok) throw new Error(json.error);
      return {
        thumb: json.file.thumb_480,
        channel: json.file.channels[0],
        projectId: jira.getJiraProjectId(json.file.title)
      };
    });
  }

  getImageFile(filePath) {
    return PostIt.fetch(filePath, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.BOT_SLACK_TOKEN}`
      }
    }).then(res => {
      return res.buffer();
    })
  }

  getBase64Image(buffer) {
    return new Promise(resolve => {
      resolve(Buffer.from(buffer).toString('base64'));
    });
  };

  getTextFromImage(base64str) {
    const postBody = {
      'requests': [
        {
          'features': [
            {
              'type': 'TEXT_DETECTION'
            }
          ],
          'image': {
            'content': base64str
          }
        }
      ]
    };

    return PostIt.fetch(`${ENDPOINTS.google}?key=${process.env.BOT_GOOGLE_VISION_API_TOKEN}`, {
      method: 'POST',
      body: JSON.stringify(postBody)
    }).then(res => {
      return res.json();
    }).then(json => {
      return json.responses[0].textAnnotations[0].description;
    });
  };

  createJiraTicket(id, description) {
    const postBody = JSON.stringify(jira.createJiraData(id, jira.createJiraDescription(description)));

    return PostIt.fetch(ENDPOINTS.jira,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Atlassian-Token': 'no-check',
          'Authorization': `Basic ${process.env.BOT_JIRA_API_TOKEN}`
        },
        method: 'POST',
        body: postBody
      })
      .then(res => {
        return res.json();
      })
      .then(res => {
        return ENDPOINTS.jiraLink + res.key;
      })
  };
}

PostIt.fetch = fetch;
PostIt.ENDPOINTS = ENDPOINTS;
module.exports = PostIt;

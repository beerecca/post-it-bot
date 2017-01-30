const _ = require('lodash');

exports.createJiraData = (projectId, description) => {
  return {
    fields: {
      project: {
        id: projectId
      },
      summary: description,
      issuetype: {
        name: 'Task'
      },
      labels: ['post-it']
    }
  }
}

exports.createJiraDescription = (description) => {
  const lowerCase = JSON.stringify(description).replace(/\\n+/g, ' ').replace(/"+/g, '').toLowerCase();
  return _.startCase(lowerCase);
}

exports.getJiraProjectId = (name) => {
  const projects = JSON.parse(process.env.BOT_JIRA_PROJECTS);
  const id = _.get(projects, name.toUpperCase());
  if (!id) throw new Error('JIRA project key must be included in the title.');
  return id;
}
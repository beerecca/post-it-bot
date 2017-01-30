const jira = require('../../../src/plugins/post-it/jira');

describe('Jira', function() {

  describe('createJiraData', function() {
    it('returns jira data with projectId and description', function() {
      const data = {
        fields: {
          project: {
            id: 'foo'
          },
          summary: 'bar',
          issuetype: {
            name: 'Task'
          },
          labels: ['post-it']
        }
      }
      expect(jira.createJiraData('foo', 'bar')).toEqual(data);
    });
  });

  describe('createJiraDescription', function() {
    it('returns a nicely formatted description', function() {
      const desc = JSON.parse('"JIRA TICKet \\n DESCRIPTION"');
      expect(jira.createJiraDescription(desc)).toEqual('Jira Ticket Description');
    });
  });

  describe('getJiraProjectId', function() {
    it('returns the id of the jira project', function() {
      process.env.BOT_JIRA_PROJECTS = JSON.stringify({"FED": "10104", "CUS": "10105"});
      expect(jira.getJiraProjectId('fed')).toEqual('10104');
    });
  });
});

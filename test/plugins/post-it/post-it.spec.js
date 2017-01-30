const PostIt = require('../../../src/plugins/post-it/post-it');
const promiseMatchers = require('@pietvanzoen/jasmine-promise-matchers');

describe('PostIt', function() {
  beforeEach(function() {
    promiseMatchers.install(jasmine);
    this.postIt = new PostIt();
    this.filePath = 'http://www.thing.com/image.jpg';
    process.env.BOT_JIRA_PROJECTS = JSON.stringify({"PRJ1": "10101", "PRJ2": "10102"});
  });

  describe('getFileFromId', function() {
    beforeEach(function() {
      this.id = '123';
      this.result = {
        ok: true,
        file: {
          thumb_480: this.filePath,
          channels: ['123'],
          title: 'PRJ1'
        }
      };
      spyOn(PostIt, 'fetch').and.returnValue(Promise.resolve({json: () => this.result}));
      spyOn(this.postIt, 'getFileFromId').and.callThrough();
    });

    it('calls the slack api with token and id', function() {
      this.postIt.getFileFromId(this.id);
      expect(PostIt.fetch).toHaveBeenCalledWith(`${PostIt.ENDPOINTS.slack}?token=${process.env.BOT_SLACK_TOKEN}&file=${this.id}`, {method: 'GET'})
    });

    it('returns a thumb file url', function(done) {
      const fileInfo = {
        thumb: this.filePath,
        channel: '123',
        projectId: '10101'
      };
      expect(this.postIt.getFileFromId(this.id)).toResolve(done, (resp) => {
        expect(resp).toEqual(fileInfo);
      })
    });
  });

  describe('getImageFile', function() {
    beforeEach(function() {
      spyOn(PostIt, 'fetch').and.returnValue(Promise.resolve('string'));
      spyOn(this.postIt, 'getImageFile').and.callThrough();
    });

    it('calls the slack api with thumb file path', function() {
      const data = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.BOT_SLACK_TOKEN}`
        }
      };
      this.postIt.getImageFile(this.filePath);
      expect(PostIt.fetch).toHaveBeenCalledWith(this.filePath, data)
    });
  });

  describe('getBase64Image', function() {
    it('returns base64 string', function(done) {
      expect(this.postIt.getBase64Image(new Buffer([]))).toResolve(done, (resp) => {
        expect(resp).toEqual('');
      })
    });
  });

  describe('getTextFromImage', function() {
    beforeEach(function() {
      this.description = 'image';
      const result = {
        responses: [
          {
            textAnnotations: [
              {
                description: this.description
              }
            ]
          }
        ]
      };
      spyOn(PostIt, 'fetch').and.returnValue(Promise.resolve({json: () => result}));
      spyOn(this.postIt, 'getTextFromImage').and.callThrough();
    });

    it('calls the google vision api with the base64 string', function() {
      const postBody = {
        "requests": [
          {
            "features": [
              {
                "type": "TEXT_DETECTION"
              }
            ],
            "image": {
              "content": this.description
            }
          }
        ]
      };

      this.postIt.getTextFromImage(this.description);
      expect(PostIt.fetch).toHaveBeenCalledWith(
        `${PostIt.ENDPOINTS.google}?key=${process.env.BOT_GOOGLE_VISION_API_TOKEN}`,
        {method: 'POST', body: JSON.stringify(postBody)});
    });

    it('returns the text on the post it', function(done) {
      expect(this.postIt.getTextFromImage('foo')).toResolve(done, (resp) => {
        expect(resp).toEqual(this.description);
      });
    });
  });

  describe('createJiraTicket', function() {
    beforeEach(function() {
      this.description = 'image';
      this.key = 'PRJ1-111';
      const res = {
        key: this.key
      };

      spyOn(PostIt, 'fetch').and.returnValue(Promise.resolve({json: () => res}));
      spyOn(this.postIt, 'createJiraTicket').and.callThrough();
    });

    it('calls the jira api', function() {
      this.postIt.createJiraTicket('10101', this.description);
      expect(PostIt.fetch).toHaveBeenCalled();
    });

    it('returns the url of the jira ticket', function(done) {
      expect(this.postIt.createJiraTicket('10101', this.description)).toResolve(done, (resp) => {
        expect(resp).toEqual(PostIt.ENDPOINTS.jiraLink + this.key)
      })
    })
  });
});

const PostItBot = require('../../src/post-it-bot');
const Botkit = require('botkit');
const botkitService = require('../../src/services/botkit');
const express = require('express');

describe('Botkit Service', () => {

  beforeEach(function() {
    process.env.BOT_SLACK_TOKEN = 'foo';
    this.controllerMock = jasmine.createSpyObj('controller', ['spawn', 'setupWebserver']);
    spyOn(Botkit, 'slackbot').and.returnValue(this.controllerMock);
    this.botMock = jasmine.createSpyObj('bot', ['startRTM', 'say']);
    this.controllerMock.spawn.and.returnValue(this.botMock);
    this.controllerMock.webserver = jasmine.createSpyObj('webserver', ['use']);
    this.startBot = () => PostItBot.start({services: [botkitService]});
  });

  afterEach(function() {
    delete process.env.BOT_SLACK_TOKEN;
  });

  it('initializes slack bot controller', function() {
    let PostItBot = this.startBot();
    expect(Botkit.slackbot).toHaveBeenCalled();
    expect(PostItBot.services.controller).toBe(this.controllerMock);
  });

  describe('bot initialization', () => {
    it('spawns a bot with slack token and starts rtm', function() {
      let PostItBot = this.startBot();
      expect(PostItBot.services.bot).toBe(this.botMock);
      expect(this.controllerMock.spawn).toHaveBeenCalledWith({token: 'foo'});
      expect(this.botMock.startRTM).toHaveBeenCalled();
    });

    it('throws error if startRTM errors', function() {
      this.botMock.startRTM.and.callFake(function(cb) {
        cb('this is an error');
      });
      expect(() => {
        this.startBot();
      }).toThrowError(/slack api/i);
    });

    it('throws error if BOT_SLACK_TOKEN is not defined', function() {
      delete process.env.BOT_SLACK_TOKEN;
      expect(() => {
        this.startBot();
      }).toThrowError(/Slack Token/i);
    });
  });

  describe('webserver initialization', function() {
    beforeEach(function() {
      process.env.BOT_PORT = 1234;
      process.env.BOT_WEB_PREFIX = '/foo';
      this.routerMock = jasmine.createSpyObj('router', ['use']);
      spyOn(express, 'Router').and.returnValue(this.routerMock);
    });

    afterEach(function() {
      delete process.env.BOT_PORT;
      delete process.env.BOT_WEB_PREFIX;
    });

    it('sets up server with env BOT_PORT', function() {
      this.startBot();
      expect(this.controllerMock.setupWebserver).toHaveBeenCalled();
      var portArg = this.controllerMock.setupWebserver.calls.mostRecent().args[0];
      expect(portArg).toBe('1234');
    });

    it('throws error if webserver setup failed', function() {
      this.controllerMock.setupWebserver.and.callFake((port, cb) => cb('an error occured'));
      expect(() => {
        this.startBot();
      }).toThrowError(/setup failed/);
    });

    describe('base route setup', function() {
      it('sets up a base route for endpoints', function() {
        this.startBot();
        expect(express.Router).toHaveBeenCalled();
        expect(this.controllerMock.webserver.use).toHaveBeenCalledWith('/foo', this.routerMock);
      });

      it('resolves base route correctly', function() {
        process.env.BOT_WEB_PREFIX = '//bar/foo';
        this.startBot();
        expect(this.controllerMock.webserver.use).toHaveBeenCalledWith('/bar/foo', this.routerMock);
      });

      it('defaults base route to root path', function() {
        delete process.env.BOT_WEB_PREFIX;
        this.startBot();
        expect(this.controllerMock.webserver.use).toHaveBeenCalledWith('/', this.routerMock);
      });
    });

    it('adds router to services', function() {
      let PostItBot = this.startBot();
      expect(PostItBot.services.router).toBe(this.routerMock);
    });
  });

});

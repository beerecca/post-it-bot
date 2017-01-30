const PostItBot = require('../src/post-it-bot');
const Eev = require('eev');

describe('PostItBot', () => {

  describe('initialization', () => {
    beforeEach(function() {
      this.fooService = jasmine.createSpy('fooService');
      this.barService = jasmine.createSpy('barService');
      this.fooPlugin = jasmine.createSpy('fooPlugin');
      this.barPlugin = jasmine.createSpy('barPlugin');
      this.makeBot = () => new PostItBot({
        services: [this.fooService, this.barService],
        plugins: [this.fooPlugin, this.barPlugin]
      });
    });

    describe('services', () => {
      it('invokes each service with addService function and PostItBot instance', function() {
        const bot = this.makeBot();
        expect(this.fooService).toHaveBeenCalled();
        expect(typeof this.fooService.calls.mostRecent().args[0]).toBe('function');
        expect(this.fooService.calls.mostRecent().args[1]).toBe(bot);
        expect(this.barService).toHaveBeenCalled();
        expect(typeof this.barService.calls.mostRecent().args[0]).toBe('function');
        expect(this.barService.calls.mostRecent().args[1]).toBe(bot);
      });

      it('services can add their service to the service object using the addService function', function() {
        this.fooService = (addService) => addService('foo', 'wibble');
        const PostItBot = this.makeBot();
        expect(PostItBot.services.foo).toBe('wibble');
      });

      it('throws if two services with the same name are added', function() {
        this.fooService = (addService) => addService('foo', 'wibble');
        this.barService = (addService) => addService('foo', 'wibble');
        expect(this.makeBot).toThrowError(/service names must be unique/i);
      });
    });

    describe('plugins', () => {
      it('invokes each plugin with PostItBot instance', function() {
        const PostItBot = this.makeBot();
        expect(this.fooPlugin).toHaveBeenCalledWith(PostItBot);
        expect(this.barPlugin).toHaveBeenCalledWith(PostItBot);
      });

      it('intializes plugins after services', function() {
        this.fooService = (addService) => addService('foo', 'wibble');
        this.fooPlugin.and.callFake((PostItBot) => {
          expect(PostItBot.services.foo).toBe('wibble');
        });
        this.makeBot();
      });

      it('does not throw if a plugin throws', function() {
        this.fooPlugin = () => { throw new Error('halp'); }
        expect(() => this.makeBot()).not.toThrowError();
      });

      it('reports plugin errors', function() {
        const errorSubscriber = jasmine.createSpy('errorSubscriber');
        const pluginError = new Error('halp');
        this.fooPlugin = () => { throw pluginError; }
        this.barService = (addService, bot) => {
          bot.events.on('plugin-error', errorSubscriber);
        }
        this.makeBot();
        expect(errorSubscriber).toHaveBeenCalledWith(pluginError);
      });
    });

    describe('events', function() {
      beforeEach(function() {
        this.bot = new PostItBot();
      });
      describe('on/emit', function() {
        it('emits and subscribes to events', function() {
          const subscriber = jasmine.createSpy('subscriber');
          const data = {foo: 'bar'};
          const data2 = {baz: 'qux'};
          this.bot.events.on('foo', subscriber);
          this.bot.events.emit('foo', data);
          expect(subscriber).toHaveBeenCalledWith(data);
          this.bot.events.emit('foo', data2);
          expect(subscriber).toHaveBeenCalledWith(data2);
        });
      });
      describe('off', function() {
        it('unsubscribes from events', function() {
          const subscriber = jasmine.createSpy('subscriber');
          this.bot.events.on('foo', subscriber);
          this.bot.events.emit('foo');
          subscriber.calls.reset();
          this.bot.events.off('foo', subscriber);
          this.bot.events.emit('foo');
          expect(subscriber).not.toHaveBeenCalled();
        });
      });
      it('services and plugins have access to events', () => {
        const service = (addService, bot) => expect(bot.events instanceof Eev).toBe(true);
        const plugin = (bot) => expect(bot.events instanceof Eev).toBe(true);
        new PostItBot({services: [service], plugins: [plugin]});
      });
    });
  });
});

const Eev = require('eev');

module.exports = class PostItBot {

  constructor(options) {
    options = options || {};
    this.events = new Eev();

    this.services = {};
    this._initializeServices(options.services || []);
    this._startPlugins(options.plugins || []);
  }

  _startPlugins(plugins) {
    plugins.forEach((plugin) => {
      try {
        plugin(this);
      } catch(e) {
        this.events.emit('plugin-error', e);
      }
    });
  }

  _initializeServices(services) {
    const addService = (name, serviceValue) => {
      if (name in this.services) {
        throw new Error(`Service names must be unique. '${name}' already exists.`);
      }
      this.services[name] = serviceValue
    };

    services.forEach((service) => {
      service(addService, this);
    });
  }

  static start(options) {
    return new PostItBot(options);
  }

};

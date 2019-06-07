import log from './log';

const getStats = port => {
  const stats = {
    counters: {},
    events: {},
  };

  const addToList = (category, field, data) => {
    if (!stats[category]) {
      stats[category] = {};
    }

    if (!stats[category][field]) {
      stats[category][field] = [];
    }

    stats[category][field].push(data);
  };

  const logDefaultMiddlewares = (statsInstance) => {
    const logMessages = [];
    if (statsInstance.getCounter('cors')) {
      logMessages.push('cors');
    }
    if (statsInstance.getCounter('jsonBodyParser')) {
      logMessages.push('bodyParser.json');
    }

    if (logMessages.length) {
      log.stats(`  Used built-in middlewares: ${logMessages.join(' and ')}`);
    }
  };

  const statsInstance = {
    set: (field, number = 1) => stats.counters[field] = number,
    add: (field, number = 1) => stats.counters[field] = stats.counters[field] ? stats.counters[field] + number : number,
    getCounter: field => stats.counters[field],
    registerEvent: (eventName, data) => {
      switch (eventName) {
        case 'registeringRoute':
          statsInstance.add('routes');
          statsInstance.add('routeHandlers', data.numberOfHandlers);
          addToList('events', eventName, { timestamp: Date.now(), ...data });
          break;
        default:
          addToList('events', eventName, { timestamp: Date.now(), ...data });
      }
    },
    getEvents: eventName => stats.events[eventName],
    logStartup: () => {
      log.stats(`-->Stats for simpleExpress app on ${port} port:<--`);
      logDefaultMiddlewares(statsInstance);
      if (statsInstance.getCounter('expressMiddlewares')) {
        log.stats(`  Registered ${statsInstance.getCounter('expressMiddlewares')} expressMiddleware${statsInstance.getCounter('expressMiddlewares') > 1 ? 's' : ''}`);
      }
      if (statsInstance.getCounter('simpleExpressMiddlewares')) {
        log.stats(`  Registered ${statsInstance.getCounter('simpleExpressMiddlewares')} simpleExpressMiddlewares${statsInstance.getCounter('simpleExpressMiddlewares') > 1 ? 's' : ''}`);
      }
      if (statsInstance.getCounter('errorHandlers')) {
        log.stats(`  Registered ${statsInstance.getCounter('errorHandlers')} errorHandlers${statsInstance.getCounter('errorHandlers') > 1 ? 's' : ''}`);
      }

      if (!statsInstance.getCounter('routes')) {
        return log.stats(`  No routes regitered`);
      }
      log.stats(`  Registered ${statsInstance.getCounter('routes')} routes with ${statsInstance.getCounter('routeHandlers')} handlers:`);
      const mappedRoutes = new Set();
      const mappedMethods = {};

      stats.events.registeringRoute.forEach(routeEvent => {
        const { path, method, numberOfHandlers, names } = routeEvent;
        if (!mappedMethods[path]) {
          mappedMethods[path] = [];
        }
        mappedMethods[path].push({ method, numberOfHandlers, names });
        mappedRoutes.add(path);
      });

      mappedRoutes.forEach(path => {
        const invalidRoute = path.indexOf('/') !== 0 && path !== '*';
        log.stats(`    ${path}${invalidRoute ? ' - WARNING: Route not starting with "/"!' : ''}`);
        mappedMethods[path].forEach(({ method, numberOfHandlers, names = [] }) => {
          let foundNames = false;
          names.forEach(name => {
            if (name !== 'anonymous') {
              foundNames = true;
            }
          });
          log.stats(`      ${method}${numberOfHandlers > 1 || foundNames ? `, ${numberOfHandlers} handler${numberOfHandlers === 1 ? '' : 's'}` : ''}${names && names.length && foundNames ? `: ${names.join(', ')}` : ''}`);
        });
      });
    },
  };

  return statsInstance;
};

export default getStats;

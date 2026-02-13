import { log } from './log';

export type Stats = {
  counters: Record<string, number>;
  events: Record<string, any>;
};

export const getStats = (port) => {
  const stats: Stats = {
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

  const logDefaultMiddlewares = (
    statsInstance: ReturnType<typeof getStats>
  ) => {
    const logMessages = [];
    if (statsInstance.getCounter('cors')) {
      logMessages.push('cors');
    }
    if (statsInstance.getCounter('jsonBodyParser')) {
      logMessages.push('bodyParser.json');
    }
    if (statsInstance.getCounter('cookieParser')) {
      logMessages.push('cookie-parser');
    }
    if (statsInstance.getCounter('helmet')) {
      logMessages.push('helmet');
    }

    if (logMessages.length) {
      log.stats(`  Used built-in middlewares: ${logMessages.join(', ')}`);
    }

    const notFoundMessages = [];
    if (statsInstance.getCounter('cors-not-found')) {
      notFoundMessages.push('cors');
    }
    if (statsInstance.getCounter('jsonBodyParser-not-found')) {
      notFoundMessages.push('bodyParser.json');
    }
    if (statsInstance.getCounter('cookieParser-not-found')) {
      notFoundMessages.push('cookie-parser');
    }
    if (statsInstance.getCounter('helmet-not-found')) {
      notFoundMessages.push('helmet');
    }

    if (notFoundMessages.length) {
      log.stats(
        `  Corresponding libraries for built-in middlewares were not installed: ${notFoundMessages.join(', ')}. To enable them, install the corresponding npm packages.`
      );
    }
  };

  const statsInstance = {
    set: (field, number = 1) => (stats.counters[field] = number),
    add: (field, number = 1) =>
      (stats.counters[field] = stats.counters[field]
        ? stats.counters[field] + number
        : number),
    getCounter: (field) => stats.counters[field],
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
    getEvents: (eventName) => stats.events[eventName],
    logStartup: () => {
      if (port) {
        log.stats(`-->Stats for simpleExpress app on ${port} port:<--`);
      } else {
        log.stats(`-->Stats for simpleExpress app (no port):<--`);
      }
      logDefaultMiddlewares(statsInstance);
      if (statsInstance.getCounter('expressMiddleware')) {
        log.stats(
          `  Registered ${statsInstance.getCounter(
            'expressMiddleware'
          )} expressMiddleware${
            statsInstance.getCounter('expressMiddleware') > 1 ? 's' : ''
          }`
        );
      }
      if (statsInstance.getCounter('middleware')) {
        log.stats(
          `  Registered ${statsInstance.getCounter('middleware')} middleware${
            statsInstance.getCounter('middleware') > 1 ? 's' : ''
          }`
        );
      }
      if (statsInstance.getCounter('errorHandlers')) {
        log.stats(
          `  Registered ${statsInstance.getCounter(
            'errorHandlers'
          )} errorHandlers${
            statsInstance.getCounter('errorHandlers') > 1 ? 's' : ''
          }`
        );
      }

      if (!statsInstance.getCounter('routes')) {
        return log.stats(`  No routes registered`);
      }
      log.stats(
        `  Registered ${statsInstance.getCounter(
          'routes'
        )} routes with ${statsInstance.getCounter('routeHandlers')} handlers:`
      );
      const mappedRoutes = new Set<string>();
      const mappedMethods: Record<string, any[]> = {};

      stats.events.registeringRoute.forEach((routeEvent) => {
        const { path, method, numberOfHandlers, names } = routeEvent;
        if (!mappedMethods[path]) {
          mappedMethods[path] = [];
        }
        mappedMethods[path].push({ method, numberOfHandlers, names });
        mappedRoutes.add(path);
      });

      mappedRoutes.forEach((path) => {
        const invalidRoute = path.indexOf('/') !== 0 && path !== '*';
        log.stats(
          `    ${path}${
            invalidRoute ? ' - WARNING: Route not starting with "/"!' : ''
          }`
        );
        mappedMethods[path].forEach(
          ({ method, numberOfHandlers, names = [] }) => {
            let foundNames = false;
            names.forEach((name) => {
              if (name !== 'anonymous') {
                foundNames = true;
              }
            });
            log.stats(
              `      ${method}${
                numberOfHandlers > 1 || foundNames
                  ? `, ${numberOfHandlers} handler${
                      numberOfHandlers === 1 ? '' : 's'
                    }`
                  : ''
              }${
                names && names.length && foundNames
                  ? `: ${names.join(', ')}`
                  : ''
              }`
            );
          }
        );
      });
    },
  };

  return statsInstance;
};

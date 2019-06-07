import debug from 'debug';

// prepare loggers using DEBUG utility
const log = debug('simpleExpress');
log.request = debug('simpleExpress:request');
log.stats = debug('simpleExpress:stats');
log.warning = debug('simpleExpress:warning');

export default log;

import debug from 'debug';

export const log = debug('simpleExpress');
log.request = debug('simpleExpress:request');
log.stats = debug('simpleExpress:stats');
log.warning = debug('simpleExpress:warning');

import utils from './utils';

export default (app) => {
  const { MIN_COLUMNS } = app.get('config');
  const { MIN_ROWS } = app.get('config');

  const _return400Error = utils.return400Error;

  return {
    name(req, res, next) {
      if (!req.body.name) {
        return _return400Error(
          res,
          'Must provide name field!',
        );
      }
      next();
    },
    columns(req, res, next) {
      if (
        req.body.columns
        && req.body.columns < MIN_COLUMNS
      ) {
        return _return400Error(
          res,
          `Number of columns has to be >= ${MIN_COLUMNS}`,
        );
      }
      next();
    },
    rows(req, res, next) {
      if (req.body.rows && req.body.rows < MIN_ROWS) {
        return _return400Error(
          res,
          `Number of rows has to be >= ${MIN_ROWS}`,
        );
      }
      next();
    },
    move(req, res, next) {
      if (!req.body.column) {
        return _return400Error(
          res,
          'Move where? Missing column!',
        );
      }
      next();
    },
    token(req, res, next) {
      if (!req.headers['x-player-token']) {
        return _return400Error(
          res,
          'Missing X-Player-Token!',
        );
      }
      next();
    },
  };
};

export default function(options) {
  options = options || {};

  return function(req, res, next) {
    res.set({
      'Strict-Transport-Security': 'max-age=31536000',
    });

    next();
  };
}

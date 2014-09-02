var mongoose = require('mongoose'),
    Upload = mongoose.model('Upload'),
    _ = require('lodash');

/**
 *  List Tracks
 */
exports.list = function (req, res, next) {
  var query = Upload.find().distinct('school');

  query.exec(function (err, schools) {
    if (err) return next(err);
    if (!schools) return res.send(404);

    var result = [],
        _schools = _.unique(schools);
    
    _schools.forEach(function (_school){
      result.push({
        value: _school,
        label: _school
      });
    });

    res.json(result);
  });
};

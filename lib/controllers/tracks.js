var mongoose = require('mongoose'),
    Upload = mongoose.model('Upload'),
    _ = require('lodash');

/**
 *  List Tracks
 */
exports.list = function (req, res, next) {
  var query = Upload.find().distinct('track');

  query.exec(function (err, tracks) {
    if (err) return next(err);
    if (!tracks) return res.send(404);

    var result = [],
        _tracks = _.unique(tracks);

    _tracks.forEach(function (_track){
      var track = {
        value: _track,
        label: ''
      };

      if (_track === 'its-a-small-world'){
        track.label = 'It\'s a Small World';
        return result.push(track);
      } else if (_track === 'enchanted-tiki-room'){
        track.label = 'Enchanted Tiki Room';
        return result.push(track);
      } else if (_track === 'haunted-mansion'){
        track.label = 'Haunted Mansion';
        return result.push(track);
      } else if (_track === 'pirates-of-the-caribbean'){
        track.label = 'Pirates of the Caribbean';
        return result.push(track);
      } else {
        track.label = 'Other';
        return result.push(track);
      }

    });

    res.json(result);
  });
};

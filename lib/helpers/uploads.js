'use strict';
var async = require('async');
var _ = require('lodash');
var util = require('util');
var BitlyApi = require('node-bitlyapi');
var twitterCardBaseUrl = 'http://promo.espn.go.com/espn/contests/disney/2014/cheermagic/twitter_cards';
var twitterCardPlayerUrl = twitterCardBaseUrl + '/player';
var twitterCardSummaryUrl = twitterCardBaseUrl + '/summary';
var bundleLink = 'https://bitly.com/bundles/espnpromotions/m';
var Bitly = new BitlyApi({
  client_id: process.env.BITLY_CLIENT_ID || '',
  client_secret: process.env.BITLY_CLIENT_SECRET || ''
});
Bitly.setAccessToken(process.env.BITLY_ACCESS_TOKEN || '');

var fitAssemblyToSchema = function(assembly){
  var uploadMeta, fileMeta, fields, props, originalFile;

  originalFile = _.first(assembly.uploads);
  fileMeta = originalFile.meta;
  fields = assembly.fields || {};
  props = ['md5hash', 'mime', 'ext', 'size', 'fields'];
  uploadMeta = _.pick(originalFile, props);
  uploadMeta = _.merge(uploadMeta, {
    uploadId: assembly.assembly_id,
    uploadedAt: new Date(assembly.notify_start),
    createdAt: new Date(fileMeta.date_file_created),
    modifiedAt: new Date(fileMeta.date_file_created),
    duration: fileMeta.duration,
    client: {
      userAgent: assembly.client_agent,
      ip: assembly.client_ip,
      referrer: assembly.client_referer
    },
    twitterCards: {
      summary: twitterCardSummaryUrl + '?id=' + assembly.assembly_id,
      player: twitterCardPlayerUrl + '?id=' + assembly.assembly_id
    },
    videos: [],
    thumbnails: []
  });

  uploadMeta = _.merge(uploadMeta, fields);

  if (_.has(fileMeta, 'device_vendor') || _.has(fileMeta, 'device_name') || _.has(fileMeta, 'device_software')){
    uploadMeta.device = {};
    if ( _.has(fileMeta.device_vendor) ){ uploadMeta.device.vendor = fileMeta.device_vendor; }
    if ( _.has(fileMeta.device_name) ){ uploadMeta.device.name = fileMeta.device_name; }
    if ( _.has(fileMeta.device_vendor) ){ uploadMeta.device.software = fileMeta.device_software; }
  }

  if ( _.has(fileMeta, 'longitude') && _.has(fileMeta, 'latitude') ){
    uploadMeta.loc = [ fileMeta.longitude, fileMeta.latitude ];
  }

  // shorten long URLs, place in bundle
  // async.parallel({
  //   player: function(callback){
  //     Bitly.shorten({ longUrl: uploadMeta.twitterCards.player }, function(shortenErr, shortenResults){
  //       shortenResults = JSON.parse(shortenResults);
  //       if (shortenErr){
  //         return callback(shortenErr, null);
  //       }
  //       console.log(util.inspect(shortenResults));
  //
  //       Bitly.addLinkToBundle({ bundle_link: bundleLink, link: shortenResults.data.url }, function (bundleErr, bundleResults){
  //         bundleResults = JSON.parse(bundleResults);
  //         if (bundleErr){
  //           return callback(bundleErr, null);
  //         }
  //         return callback(null, shortenResults.data.url);
  //       });
  //
  //     });
  //   },
  //   summary: function(callback){
  //     Bitly.shorten({ longUrl: uploadMeta.twitterCards.summary }, function(shortenErr, shortenResults){
  //       shortenResults = JSON.parse(shortenResults);
  //       if (shortenErr){
  //         return callback(shortenErr, null);
  //       }
  //       console.log(util.inspect(shortenResults));
  //
  //       Bitly.addLinkToBundle({ bundle_link: bundleLink, link: shortenResults.data.url }, function (bundleErr, bundleResults){
  //         bundleResults = JSON.parse(bundleResults);
  //         if (bundleErr){
  //           return callback(bundleErr, null);
  //         }
  //         return callback(null, shortenResults.data.url);
  //       });
  //
  //     });
  //   }
  // },
  // function(err, results) {
  //   if (err){
  //     console.error(err);
  //     return;
  //   }
  //   uploadMeta.twitterCards.player = results.player || uploadMeta.twitterCards.player;
  //   uploadMeta.twitterCards.summary = results.summary || uploadMeta.twitterCards.summary;
  // });

  return uploadMeta;
};

var fitResultToSchema = function(result){
  var fileCore, fileMeta, props;

  fileMeta = result.meta;
  props = ['id', 'field', 'original_id', 'original_basename', 'original_md5hash', 'meta'];
  fileCore = _.omit(result, props);
  fileCore = _.merge(fileCore, {
    fileId: result.id,
    width: fileMeta.width,
    height: fileMeta.height
  });

  if (_.has(fileMeta, 'thumb_index')){
    fileCore.thumb_index = fileMeta.thumb_index;
  }

  //console.log(util.inspect(fileCore));
  return fileCore;
};

exports.fitToSchema = function(result){
  if (_.has(result, 'assembly_id')){
    return fitAssemblyToSchema(result);
  }
  return fitResultToSchema(result);
};

return exports;

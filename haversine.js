// http://en.wikipedia.org/wiki/Haversine_formula

(function () {

  'use strict';

  var
    haversine,
    VERSION = '1.0.0',
    ZERO = 0,
    RADIAN = (Math.PI / 180),
    DEFAULT_RADIUS_KM = 6371,

    UNITS_KM = 'km',
    UNITS_M = 'm',
    UNITS_MI = 'mi',
    UNITS_YD = 'yd',
    UNITS_FT = 'ft',
    UNITS_KM_COEFF = 1,
    UNITS_M_COEFF = 1000,
    UNITS_MI_COEFF = (1 / 1.609269392),
    UNITS_YD_COEFF = (UNITS_MI_COEFF * 1760),
    UNITS_FT_COEFF = (UNITS_YD_COEFF * 3),

    // check for nodeJS
    hasModule = (typeof module !== 'undefined' && module.exports);

  // use Lodash
  var _ = require('lodash');

  /**
   * Computes the great-circle distance between two points.
   * @param  {Object} pt1       First point
   * @param  {Number} pt1.latitude       First point latitude position
   * @param  {Number} pt1.longitude       First point longitude position
   * @param  {Object} pt2       Second point
   * @param  {Number} pt2.latitude       Second point latitude position
   * @param  {Number} pt2.longitude       Second point longitude position
   * @param  {Number} [radius=DEFAULT_RADIUS_KM]       Radius to use
   * @param  {Boolean} [inRadians=false] Are the points already in radians?
   * @return {Number}           Number with
   */
  function compute (pt1, pt2, radius, inRadians) {
    var pt1lat, pt1lng, pt2lat, pt2lng;

    // get a default radius, if required
    radius = radius || DEFAULT_RADIUS_KM;

    // reference individual coordinates
    pt1lat = pt1.latitude;
    pt1lng = pt1.longitude;
    pt2lat = pt2.latitude;
    pt2lng = pt2.longitude;

    // convert degrees to radians, unless already in radians
    if ( ! inRadians) {
      pt1lat = d2r(pt1lat);
      pt1lng = d2r(pt1lng);
      pt2lat = d2r(pt2lat);
      pt2lng = d2r(pt2lng);
    }

    // return 0 if the coordinates are identical
    if (pt1lat === pt2lat && pt1lng === pt2lng) {
      return ZERO;
    }

    // perform the haversine calculation
    return Math.acos(
      Math.sin( pt1lat ) * Math.sin( pt2lat ) +
      Math.cos( pt1lat ) * Math.cos( pt2lat ) *
      Math.cos( pt2lng - pt1lng )
    ) * radius;
  }

  /**
   * Converts degrees to radians
   * @param  {Number} deg Angle in degrees
   * @return {Number}     Angle in radians
   */
  function d2r (deg) {
    return deg * RADIAN;
  }

  /**
   * Returns the default options; these may be overridden.
   * @return {Object} Default options
   */
  function getDefaultOptions () {
    return {
      // operate in kilometers
      units: UNITS_KM,

      // use radius of Earth, in kilometers
      radius: DEFAULT_RADIUS_KM,

      // provided coordinates are in degrees
      radians: false,

      // do not apply precision
      precision: false,

      // if this is set, check that the computed distance is within this value
      within: false
    };
  }

  /**
   * [haversine description]
   * @param  {Object} pt1       First point
   * @param  {Number} pt1.latitude       First point latitude position
   * @param  {Number} pt1.longitude       First point longitude position
   * @param  {Object} pt2       Second point
   * @param  {Number} pt2.latitude       Second point latitude position
   * @param  {Number} pt2.longitude       Second point longitude position
   * @param {Object} [options] Configuration options
   * @param {String} [options.units=km] Units to operate in; valid values: km|m|mi|yd|ft
   * @param {Number} [options.radius=6371] Mean radius of the Earth, in kilometers. If `options.units` and `options.radius` are both specified, it is assumed that the radius is already in the desired units.
   * @param {Boolean} [options.radians=false] Are the provided coordinates expressed in radians?
   * @param {Integer|Boolean} [options.precision=false] Round the result to this many significant digits.
   * @return {Number|Boolean}         Returns the distance in the requested units, or a Boolean if the `options.within` parameter was set.
   */
  haversine = function (pt1, pt2, options) {
    var radius, distance;

    // check the input
    if (
      (! _.isObject(pt1) || ! _.has(pt1, 'latitude') || ! _.has(pt1, 'longitude')) ||
      (! _.isObject(pt2) || ! _.has(pt2, 'latitude') || ! _.has(pt2, 'longitude'))
    ) {
      throw new Error('haversine requires two objects with latitude and longitude properties');
    }

    // calculate the radius to work with
    radius = (options && options.radius) || DEFAULT_RADIUS_KM;
    if (options && options.units && ! options.radius) {
      switch (options.units) {
        case UNITS_KM:
          radius *= UNITS_KM_COEFF;
          break;
        case UNITS_M:
          radius *= UNITS_M_COEFF;
          break;
        case UNITS_MI:
          radius *= UNITS_MI_COEFF;
          break;
        case UNITS_YD:
          radius *= UNITS_YD_COEFF;
          break;
        case UNITS_FT:
          radius *= UNITS_FT_COEFF;
          break;
        default:
          // no conversion
      }
    }

    // get options
    options = _.defaults(options || {}, getDefaultOptions());

    // compute the distance
    distance = compute(
      pt1,
      pt2,
      radius,
      options.radians
    );

    // check the distance threshold, returning a Boolean
    if (options.within) {
      return distance <= options.within;
    }

    // apply a precision?
    if (options.precision) {
      distance = Number( distance.toPrecision( +options.precision ) );
    }

    // return the distance
    return distance;
  };

  // CommonJS module is defined
  if (hasModule) {
    module.exports = haversine;
  }

  /*global define:false */
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return haversine;
    });
  }

}).call(this);
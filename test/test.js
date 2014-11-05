var haversine = require('../haversine'),
    assert = require('chai').assert;

suite('haversine', function(){

  var milan, minsk, mm, moonRadius=1737.4;

  // start point
  milan = {
    latitude: 45.465422,
    longitude: 9.185924
  };

  // end point
  minsk = {
    latitude: 53.9,
    longitude: 27.566667
  };

  // precalculate the Milan-Minsk distance
  mm = haversine(milan, minsk);

  // function to count the number of signficant digits
  // hmm, maybe this should be a module on its own?
  function getSignificantDigits (n) {

    // examples to consider:
    // 12300    # 3 SD
    // -0.0123  # 3 SD
    // 1.2e-5   # 2 SD
    // -1e-5    # 1 SD
    // 10.01    # 4 SD

    var s, m, p, exp;

    // convert to exponential
    s = n.toExponential();

    // find a continuous string of digits/decimals; ignore sign (leading "-")
    // or exponential notation (trailing "e-6")
    m = s.match(/^\-?([\.0-9]+)/);

    // check?
    if ( ! m || m.length < 2) {
      throw new Error('getSignificantDigits could not parse '+ n);
    }

    // reassign match
    s = m[1];

    // replace decimal points
    s = s.replace(/\./g, '');

    // return the string length
    return s.length;
  };

  // start tests
  test('Not providing two locations shoud throw an error', function () {
    assert.throws(haversine, Error);
  });
  
  test('Providing a (truthy) `within` option should return a Boolean', function () {
    assert.isBoolean(haversine(milan, milan, { within:1 }));
  });

  test('Milan-Milan distance should be zero', function () {
    assert.equal(0, haversine(milan, milan));
  });

  test('Milan is within 10,000km of Minsk', function () {
    assert.isTrue(haversine(milan, minsk, { within:10000 }));
  });

  test('Milan is not within 1,500km of Minsk', function () {
    assert.isFalse(haversine(milan, minsk, { within:1500 }));
  });

  test('Milan-Minsk & Minsk-Milan distance is identical', function () {
    assert.isTrue(haversine(milan, minsk) === haversine(minsk, milan));
  });

  test('Milan-Minsk is 1600km when rounded to the nearest 100km', function () {
    assert.equal(1600, haversine(milan, minsk, { precision:2 }));
  });

  test('If the Earth were shrunk to the size of the Moon, Milan & Minsk would be closer', function () {
    assert.isTrue(haversine(milan, minsk, { radius:moonRadius }) < mm );
  });

  var sd = 17;
  test('Setting precision to '+sd+' should result in '+sd+' significant digits', function () {
    assert.equal(sd, getSignificantDigits( haversine(milan, minsk, { precision:sd }) ) );
  });

  test('Milan-Minsk distance in feet should be 3 times the distance in yards', function () {
    assert.equal(3, Number( (haversine(milan, minsk, { units:'ft' }) / haversine(milan, minsk, { units:'yd' })).toPrecision(10) ) );
  });

});
var assert = require("assert"); // node.js core module
var reader = require("../reader.js");

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(4)); // 4 is not present in this array so indexOf returns -1
    });
  });
});

describe('reader.js', function(){
  describe('getData()', function(){
    it('should no error when calling getDate()', function(){
      var list = [2];
      reader.getData(list);
      assert.equal(1, 1);
    });
  });
});

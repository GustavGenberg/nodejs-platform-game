module.exports = {
  Pattern: [5, {
    0: 'x',
    1: 'y',
    2: 'w',
    3: 'h',
    4: 't',
    5: 'id'
  }],
  Encode: function (Object) {
    var p = this.Pattern;
    var e = JSON.stringify(Object);
    /*for (o in Object) {
      var o = Object[o];
      e = e + o.x;
      e = e + o.y;
      e = e + o.w;
      e = e + o.h;
      e = e + o.t;
      e = e + o.id;
    }*/
    return e;
  },
  Decode: function (Object) {
    var p = this.Pattern;
    var e = JSON.parse(Object);

    return e;
  }
};

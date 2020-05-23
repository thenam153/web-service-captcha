module.exports = {
    randomKey: function(len) {
        var str = "";                                // String result
        for (var i = 0; i < len; i++) {              // Loop `len` times
          var rand = Math.floor(Math.random() * 62); // random: 0..61
          var charCode = rand += rand > 9 ? (rand < 36 ? 55 : 61) : 48; // Get correct charCode
          str += String.fromCharCode(charCode);      // add Character to str
        }
        return str; // After all loops are done, return the concatenated string
      }
}
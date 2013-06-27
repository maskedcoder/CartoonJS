/*
 * QUnit Canvas assertion plugin, v1.0.2-pre
 * A QUnit plugin for asserting individual pixel values within a Canvas element.
 * Copyright jQuery Foundation and other contributors
 * MIT License http://www.opensource.org/licenses/mit-license.php
 */

QUnit.extend(QUnit.assert, {
  pixelEqual: function(canvas, x, y, r, g, b, a, message) {
    var actual = Array.prototype.slice.apply(canvas.getContext("2d").getImageData(x, y, 1, 1).data),
        expected = [r, g, b, a];
    QUnit.push(QUnit.equiv(actual, expected), actual, expected, message);
  }
});
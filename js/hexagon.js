// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

function HexagonGrid(canvasId, radius, square) {
    this.radius = radius;
    this.square = square;

    if (square) {
      this.height = radius;
      this.width = radius;
      this.side = radius;
    } else {
      this.height = Math.sqrt(3) * radius;
      this.width = 2 * radius;
      this.side = (3 / 2) * radius;
    }

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvasOriginX = 0;
    this.canvasOriginY = 0;

    //this.canvas.addEventListener("mousedown", this.clickEvent.bind(this), false);
};

HexagonGrid.prototype.drawHexGrid = function (rows, cols, originX, originY, isDebug, HexagonGridPrint, colorSetting) {
    this.canvasOriginX = originX;
    this.canvasOriginY = originY;

    var currentHexX;
    var currentHexY;
    var debugText = "";

    var offsetColumn = false;
    var colorSet = ["#0067A6", "#00ABD8", "#008972", "#EFC028", "#F2572D"];

    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {

            if (!offsetColumn) {
                currentHexX = (col * this.side) + originX;
                currentHexY = (row * this.height) + originY;
            } else {
                currentHexX = col * this.side + originX;
                this.square ? currentHexY = (row * this.height) + originY : currentHexY = (row * this.height) + originY + (this.height * 0.5);
            }

            if (isDebug) {
                debugText = col + "," + row;
            }

            switch (colorSetting) {
              case 'color':
                var color = colorSet[Math.floor((Math.random()*5))];
                break;
              case 'rule': // #FFF, #FF0, #00F
                var pattern = ['#00F', '#FFF', '#FF0'],
                    pattern_first = ['#FFF', '#FF0', '#00F'];
                (col % 2 == 0) ? color = pattern_first[(row%3)] : color = pattern[(row%3)];
                break;
              case 'spec':
                color = document.getElementById('assignColor').value;
                break;
              case 'custom':
                if($($('.polygontype:checked')[0]).attr('id') == 'hexagon') {
                  var temp_pattern = [];
                  for (var i = 1; i < 5; i++) {
                    if(document.getElementById('color'+i).value != '') {
                      temp_pattern.push(document.getElementById('color'+i).value);
                    }
                  }

                  switch (temp_pattern.length) {
                    case 1:
                      color = temp_pattern[0];
                      break;
                    case 3:
                      var pattern = [document.getElementById('color1').value, document.getElementById('color2').value, document.getElementById('color3').value],
                          pattern_first = [document.getElementById('color2').value, document.getElementById('color3').value, document.getElementById('color1').value];
                      (col % 2 == 0) ? color = pattern_first[(row%3)] : color = pattern[(row%3)];
                      break;
                    default:
                      alert("Color Setting Error!");
                      return false;
                  }

                } else {
                  var temp_pattern = [];
                  for (var i = 1; i < 5; i++) {
                    if(document.getElementById('color'+i).value != '') {
                      temp_pattern.push(document.getElementById('color'+i).value);
                    }
                  }

                  switch (temp_pattern.length) {
                    case 1:
                      color = temp_pattern[0];
                      break;
                    case 2:
                      var pattern = [document.getElementById('color1').value, document.getElementById('color2').value],
                          pattern_first = [document.getElementById('color2').value, document.getElementById('color1').value];
                      (col % 2 == 0) ? color = pattern_first[(row%2)] : color = pattern[(row%2)];
                      break;
                    case 4:
                      var pattern = [document.getElementById('color1').value, document.getElementById('color2').value],
                          pattern_first = [document.getElementById('color3').value, document.getElementById('color4').value];
                      (col % 2 == 0) ? color = pattern_first[(row%2)] : color = pattern[(row%2)];
                      break;
                    default:
                      alert("Color Setting Error!");
                      return false;
                  }

                }

                break;
              default:
                var color = '#FFF';
            }

            this.drawHex(currentHexX, currentHexY, color, debugText);
            HexagonGridPrint.drawHex(currentHexX, currentHexY, color, debugText);
        }
        offsetColumn = !offsetColumn;
    }
};

HexagonGrid.prototype.drawHexAtColRow = function(column, row, color) {
    var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY : (row * this.height) + this.canvasOriginY + (this.height / 2);
    var drawx = (column * this.side) + this.canvasOriginX;

    this.drawHex(drawx, drawy, color, "");
};

HexagonGrid.prototype.drawHex = function(x0, y0, fillColor, debugText) {
    this.context.strokeStyle = "#000";
    this.context.beginPath();
    this.context.moveTo(x0 + this.width - this.side, y0);
    this.context.lineTo(x0 + this.side, y0);
    this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
    this.context.lineTo(x0 + this.side, y0 + this.height);
    this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
    this.context.lineTo(x0, y0 + (this.height / 2));

    if (fillColor) {
        this.context.fillStyle = fillColor;
        this.context.fill();
    }

    this.context.closePath();
    this.context.stroke();

    if (debugText) {
        this.context.font = "8px";
        this.context.fillStyle = "#000";
        this.context.fillText(debugText, x0 + (this.width / 2) - (this.width/4), y0 + (this.height - 5));
    }
};

//Recusivly step up to the body to calculate canvas offset.
HexagonGrid.prototype.getRelativeCanvasOffset = function() {
	var x = 0, y = 0;
	var layoutElement = this.canvas;
    if (layoutElement.offsetParent) {
        do {
            x += layoutElement.offsetLeft;
            y += layoutElement.offsetTop;
        } while (layoutElement = layoutElement.offsetParent);

        return { x: x, y: y };
    }
}

//Uses a grid overlay algorithm to determine hexagon location
//Left edge of grid has a test to acuratly determin correct hex
HexagonGrid.prototype.getSelectedTile = function(mouseX, mouseY) {

	var offSet = this.getRelativeCanvasOffset();

    mouseX -= offSet.x;
    mouseY -= offSet.y;

    var column = Math.floor((mouseX) / this.side);
    var row = Math.floor(
        column % 2 == 0
            ? Math.floor((mouseY) / this.height)
            : Math.floor(((mouseY + (this.height * 0.5)) / this.height)) - 1);


    //Test if on left side of frame
    if (mouseX > (column * this.side) && mouseX < (column * this.side) + this.width - this.side) {


        //Now test which of the two triangles we are in
        //Top left triangle points
        var p1 = new Object();
        p1.x = column * this.side;
        p1.y = column % 2 == 0
            ? row * this.height
            : (row * this.height) + (this.height / 2);

        var p2 = new Object();
        p2.x = p1.x;
        p2.y = p1.y + (this.height / 2);

        var p3 = new Object();
        p3.x = p1.x + this.width - this.side;
        p3.y = p1.y;

        var mousePoint = new Object();
        mousePoint.x = mouseX;
        mousePoint.y = mouseY;

        if (this.isPointInTriangle(mousePoint, p1, p2, p3)) {
            column--;

            if (column % 2 != 0) {
                row--;
            }
        }

        //Bottom left triangle points
        var p4 = new Object();
        p4 = p2;

        var p5 = new Object();
        p5.x = p4.x;
        p5.y = p4.y + (this.height / 2);

        var p6 = new Object();
        p6.x = p5.x + (this.width - this.side);
        p6.y = p5.y;

        if (this.isPointInTriangle(mousePoint, p4, p5, p6)) {
            column--;

            if (column % 2 == 0) {
                row++;
            }
        }
    }

    return  { row: row, column: column };
};


HexagonGrid.prototype.sign = function(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

//TODO: Replace with optimized barycentric coordinate method
HexagonGrid.prototype.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3) {
    var b1, b2, b3;

    b1 = this.sign(pt, v1, v2) < 0.0;
    b2 = this.sign(pt, v2, v3) < 0.0;
    b3 = this.sign(pt, v3, v1) < 0.0;

    return ((b1 == b2) && (b2 == b3));
};

HexagonGrid.prototype.clickEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;

    var tile = this.getSelectedTile(localX, localY);
    if (tile.column >= 0 && tile.row >= 0) {
        var drawy = tile.column % 2 == 0 ? (tile.row * this.height) + this.canvasOriginY + 6 : (tile.row * this.height) + this.canvasOriginY + 6 + (this.height / 2);
        var drawx = (tile.column * this.side) + this.canvasOriginX;

        this.drawHex(drawx, drawy - 6, "rgba(110,110,70,0.3)", "");
    }
};

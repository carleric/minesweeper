var gameBoardSize = 9;
var numberOfMines = 3;

var buildGame = function() {
  var gameBoard = $("#gameBoard");

  for(var i = 0; i < gameBoardSize; i++) {
    for(var j = 0; j < gameBoardSize; j++) {
      var cellDiv = $(document.createElement("div"));
      cellDiv.addClass("cell");
      cellDiv.attr("id", "cell_" + i + "_" + j);
      cellDiv.mouseup(function(event) {
        //alert("moused up on cell=" + this.id);
      })
      gameBoard.append(cellDiv);
    }
  }

}

buildGame();

var gameBoardSize = 9;
var numberOfMines = 5;
var minesInGame = [numberOfMines];

var buildGame = function() {

  for(var i = 0; i < numberOfMines; i++) {
    minesInGame[i] = Math.floor(Math.random() * (gameBoardSize * gameBoardSize));
  }
  //minesInGame = [3, 22, 40];

  var gameBoard = $("#gameBoard");

  var cellId = 0;
  for(var i = 0; i < gameBoardSize; i++) {
    for(var j = 0; j < gameBoardSize; j++) {
      var cellDiv = $(document.createElement("div"));
      cellDiv.addClass("cell");
      if(cellHasMine(cellId)) {
        cellDiv.addClass("cell_mine");
      } else {
        var mineCount = numberOfMinesInPerimeter(cellId);
        if(mineCount > 0) {
          cellDiv.append("<span>" + mineCount + "</span>");
        }
      }
      cellDiv.attr("id", cellId);
      cellDiv.mouseup(cellMouseUp);
      cellDiv.click(cellClick);
      gameBoard.append(cellDiv);
      cellId ++;
    }
  }

}
var cellMouseUp = function(event) {
  //alert("moused up on cell=" + this.id + " hasMine="+cellHasMine(this.id));
}

var cellHasMine = function(cellId) {
  return minesInGame.indexOf(cellId) != -1;
}

var idsOfNeighbors = function(cellId) {
  var neighbors = [];
  //left
  if(cellId % gameBoardSize != 0) {
    neighbors.push(cellId - 1);
  }
  //top left
  if(cellId % gameBoardSize != 0 && cellId >= gameBoardSize) {
    neighbors.push(cellId - gameBoardSize - 1);
  }
  //top
  if(cellId >= gameBoardSize) {
    neighbors.push(cellId - gameBoardSize);
  }
  //top right
  if(cellId >= gameBoardSize && ((cellId+1) % gameBoardSize) != 0) {
    neighbors.push(cellId - gameBoardSize + 1);
  }
  //right
  if(((cellId+1) % gameBoardSize) != 0) {
    neighbors.push(cellId + 1);
  }
  //right bottom
  if(((cellId+1) % gameBoardSize) != 0 && cellId <= (gameBoardSize-1)*gameBoardSize) {
    neighbors.push(cellId + 1 + gameBoardSize);
  }
  //bottom
  if(cellId <= (gameBoardSize-1)*gameBoardSize) {
    neighbors.push(cellId + gameBoardSize);
  }
  //bottom  left
  if(cellId % gameBoardSize != 0 && cellId <= (gameBoardSize-1)*gameBoardSize) {
    neighbors.push(cellId - 1 + gameBoardSize);
  }
  return neighbors;
}

var numberOfMinesInPerimeter = function(cellId) {
  var neighbors = idsOfNeighbors(cellId);
  var countOfMines = 0;
  for (var i = 0; i < neighbors.length; i++) {
    if(cellHasMine(neighbors[i])) countOfMines++;
  }
  return countOfMines;
}

var cellClick = function(event) {
  if(cellHasMine(parseInt(this.id))) {
    $(this).removeClass('cell_mine');
    $(this).addClass('cell_mine_exploded');
  }
}



buildGame();

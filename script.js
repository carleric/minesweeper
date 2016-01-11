var gameBoardSize = 9;
var numberOfMines = 5;
var minesInGame = [numberOfMines];
var cellsFlagged = [];
var cellsCovered = [];
var cellHints = [];
var gameIsOver = false;
var lastContextClickedId;//ignore mouseup on cell that was just flagged

var buildGame = function() {

  for(var i = 0; i < numberOfMines; i++) {
    minesInGame[i] = Math.floor(Math.random() * (gameBoardSize * gameBoardSize));
  }

  var gameBoard = $("#gameBoard");

  var cellId = 0;
  for(var i = 0; i < gameBoardSize; i++) {
    for(var j = 0; j < gameBoardSize; j++) {
      var cellDiv = $(document.createElement("div"));

      cellDiv.append("<div class='cell_cover'></div>");

      cellDiv.addClass("cell");
      if(cellHasMine(cellId)) {
        cellDiv.addClass("cell_mine");
      } else {
        var mineCount = numberOfMinesInPerimeter(cellId);
        if(mineCount > 0) {
          cellDiv.append(mineCount);
          cellHints[cellId] = mineCount;
        }
      }
      cellDiv.attr("id", cellId);
      cellDiv.mouseup(cellMouseUp);
      cellDiv.contextmenu(cellContextClick);
      gameBoard.append(cellDiv);
      cellsCovered.push(cellId);
      cellId ++;
    }
  }

}
var cellMouseUp = function(e) {
  e.preventDefault();
  var cellId = parseInt(this.id);

  console.log("moused up on cell=" + cellId + " hasMine="+cellHasMine(cellId) + " gameIsOver="+gameIsOver);

  if(gameIsOver) return;
  if(cellId == lastContextClickedId) return;

  //explosion!
  if(cellHasMine(cellId)) {
    explodeCell(cellId);
    gameIsOver = true;
  }

  //uncover
  else if(_.contains(cellsCovered, cellId)) {
    unCoverCells(cellId);
  }

}

var cellHasMine = function(cellId) {
  return _.contains(minesInGame, cellId);
}

var idsOfCoveredNeighbors = function(cellId) {
    return _.intersection(cellsCovered, idsOfNeighbors(cellId));
}

var idsOfNeighbors = function(cellId) {
  var neighbors = [];
  cellId = parseInt(cellId);
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


}

//context click
var cellContextClick = function(e) {
  console.log("context click on id=" + this.id)
  e.preventDefault();
  lastContextClickedId = this.id;

  if(! _.contains(cellsFlagged, this.id)) {
    cellsFlagged.push(this.id);
    $(this).children(".cell_cover").addClass('cell_flagged');
    checkStatus();
  } else {
    cellsFlagged.splice(cellsFlagged.indexOf(this.id), 1);
    $(this).children(".cell_cover").removeClass('cell_flagged');
  }
}

var checkStatus = function() {
  if(cellsFlagged.length == minesInGame.length) {
    matchCount = 0;
    for(var i = 0; i < cellsFlagged.length; i++) {
      if(_.contains(minesInGame, parseInt(cellsFlagged[i]))) {
        matchCount ++;
      }
    }
    if(matchCount == minesInGame.length) {
      alert ('you won!');
      gameIsOver = true;
    }
  }
}

var cellWithId = function(cellId) {
  return $(gameBoard).children("#" + cellId);
}

var explodeCell = function(cellId) {
  unCoverCell(cellId);
  var cell = cellWithId(cellId);
  cell.removeClass('cell_mine');
  cell.addClass('cell_mine_exploded');
}

var unCoverCell = function(cellId) {
  console.log("uncovering cell="+cellId)
  if(_.contains(cellsCovered, cellId)) {
    cellsCovered = _.without(cellsCovered, cellId);
    var cell = cellWithId(cellId);
    var cellCover = cell.children(".cell_cover");
    if(cellCover != null) {
      cellCover.remove();
    }
  }
}

var unCoverCells = function(cellId) {
  var hintsUncovered = 0; //stop uncovering cells after maximum number of hints have been uncovered
  unCoverCell(cellId);
  var neighborIds = idsOfCoveredNeighbors(cellId);
  while(neighborIds.length > 0 && hintsUncovered < 4) {
    neighborId = neighborIds.pop();
    console.log("checking id=" + neighborId + " neighborIds.length=" + neighborIds.length + " hintsUncovered=" + hintsUncovered);
    if(!cellHasMine(neighborId)) {
      if(cellHints[neighborId] > 0) hintsUncovered++;
      unCoverCell(neighborId);
    }
    if(neighborIds.length == 1) { //when the last perimeter cell is uncovered, look for more to uncover in its proximity
      console.log("checking for more cells to uncover");
      neighborIds = _.union(neighborIds, idsOfCoveredNeighbors(neighborId));
    }
  }
}





buildGame();

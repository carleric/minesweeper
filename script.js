var gameBoardSize = 9;
var numberOfMines = 10;
var minesInGame = [numberOfMines];
var cellsFlagged = [];
var cellsCovered = [];
var cellHints = [];
var gameIsOver = false;
var lastContextClickedId;//ignore mouseup on cell that was just flagged
var countOfMinesRemaining;
var timeElapsed = 0;
var timerId;

var buildGame = function() {

  for(var i = 0; i < numberOfMines; i++) {
    minesInGame[i] = Math.floor(Math.random() * (gameBoardSize * gameBoardSize));
  }
  minesInGame = _.uniq(minesInGame);
  countOfMinesRemaining = minesInGame.length;
  $("#gameMinesRemaining").text(countOfMinesRemaining);

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

  //start game timer
  if(timerId == null) {
    timerId = window.setInterval(incrementTime, 1000);
  }

  //explosion!
  if(cellHasMine(cellId)) {
    explodeCell(cellId);
    gameIsOver = true;
    window.clearInterval(timerId);
  }

  //uncover
  else if(_.contains(cellsCovered, cellId)) {
    unCoverCells(cellId);
  }

}

var incrementTime = function() {
  //console.log("timerClick, timeElapsed="+timeElapsed)
  timeElapsed ++;
  var timeElapsedString = timeElapsed.toString();
  if(timeElapsedString.length == 1) {
    timeElapsedString = "00" + timeElapsedString;
  } else if(timeElapsedString.length == 2) {
    timeElapsedString = "0" + timeElapsedString;
  }
  $("#gameTimeElapsed").text(timeElapsedString);
}

var cellHasMine = function(cellId) {
  return _.contains(minesInGame, cellId);
}

var idsOfCoveredUnflaggedNeighbors = function(cellId) {
    return _.difference(_.difference(_.intersection(cellsCovered, idsOfNeighbors(cellId)), cellsFlagged), minesInGame);
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
  var cellId = parseInt(this.id);
  lastContextClickedId = cellId;

  if(! _.contains(cellsFlagged, cellId)) {
    cellsFlagged.push(cellId);
    $(this).children(".cell_cover").addClass('cell_flagged');
    checkStatus();
    countOfMinesRemaining --;
  } else {
    cellsFlagged.splice(cellsFlagged.indexOf(cellId), 1);
    $(this).children(".cell_cover").removeClass('cell_flagged');
    countOfMinesRemaining ++;
  }

  $("#gameMinesRemaining").text(countOfMinesRemaining);
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
      window.clearInterval(timerId);
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
  console.log("uncovering cell="+cellId + " cellsCovered.length=" + cellsCovered.length)
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
  var neighborIds = idsOfCoveredUnflaggedNeighbors(cellId);
  while(neighborIds.length > 0 && hintsUncovered < 4) {
    neighborId = neighborIds.pop();
    console.log("checking id=" + neighborId + " neighborIds.length=" + neighborIds.length + " hintsUncovered=" + hintsUncovered);
    if(!cellHasMine(neighborId)) {
      if(cellHints[neighborId] > 0) {
        hintsUncovered++;
      }
      unCoverCell(neighborId);
    }

    //when the last perimeter cell is uncovered, look for more to uncover in its proximity
    if(neighborIds.length == 0) {
      neighborIds = idsOfCoveredUnflaggedNeighbors(neighborId);
      console.log("added more ids to uncover {" + neighborIds + "}");
    }
  }
}





buildGame();

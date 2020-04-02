/*
  Connect 4 Game logic

  Written for Blueprints: Express.js, Chapter 3

*/
const MIN_ROWS = 6;
const MIN_COLUMNS = 7;
const players = ['x', 'o'];

function consolePrint(msg) {
  process.stdout.write(msg);
}

// Initializes and returns the board as a 2D array.
// Arguments accepted are int rows, int columns,
// Default values: rows = 6, columns = 7
export function initializeBoard(rows, columns) {
  const board = [];
  rows = rows || MIN_ROWS;
  columns = columns || MIN_COLUMNS;

  // Default values is minimum size of the game
  if (rows < MIN_ROWS) {
    rows = MIN_ROWS;
  }

  if (columns < MIN_COLUMNS) {
    columns = MIN_COLUMNS;
  }

  // Generate board
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push(' ');
    }
    board.push(row);
  }
  return board;
}

// Used to draw the board to console, mainly for debugging
export function drawBoard(board) {
  let j;
  let i;
  const numCols = board[0].length;
  const numRows = board.length;
  consolePrint(' ');
  for (i = 1; i <= numCols; i++) {
    consolePrint(`${i}`);
    consolePrint(' ');
  }
  consolePrint('\n');
  for (j = 0; j < numCols * 2 + 1; j++) {
    consolePrint('-');
  }
  consolePrint('\n');
  for (i = 0; i < numRows; i++) {
    consolePrint('|');
    for (j = 0; j < numCols; j++) {
      consolePrint(`${board[i][j]}`);
      consolePrint('|');
    }
    consolePrint('\n');
    for (j = 0; j < numCols * 2 + 1; j++) {
      consolePrint('-');
    }
    consolePrint('\n');
  }
}

// Make a move for the specified player, at the indicated column for this board
// Player should be the player number, 1 or 2
export function makeMove(player, column, board) {
  if (player !== 1 && player !== 2) {
    return false;
  }
  const p = players[player - 1];
  for (let i = board.length - 1; i >= 0; i--) {
    if (board[i][column - 1] === ' ') {
      board[i][column - 1] = p;
      return board;
    }
  }
  return false;
}

// Check for victory on behalf of the player on this board, starting at location (row, column)
// Player should be the player number, 1 or 2
export function checkForVictory(
  player,
  lastMoveColumn,
  board,
) {
  if (player !== 1 && player !== 2) {
    return false;
  }
  const p = players[player - 1];
  const directions = [
    [1, 0],
    [1, 1],
    [0, 1],
    [1, -1],
  ];
  const rows = board.length;
  const columns = board[0].length;
  let lastMoveRow;
  lastMoveColumn--;
  // Get the lastMoveRow based on the lastMoveColumn
  for (let r = 0; r < rows; r++) {
    if (board[r][lastMoveColumn] !== ' ') {
      lastMoveRow = r;
      break;
    }
  }

  for (let i = 0; i < directions.length; i++) {
    let j;
    let matches = 0;
    // Check in the 'positive' direction
    for (j = 1; j < Math.max(rows, columns); j++) {
      if (
        board[lastMoveRow + j * directions[i][1]]
        && p
          === board[lastMoveRow + j * directions[i][1]][
            lastMoveColumn + j * directions[i][0]
          ]
      ) {
        matches++;
      } else {
        break;
      }
    }
    // Check in the 'negative' direction
    for (j = 1; j < Math.max(rows, columns); j++) {
      if (
        board[lastMoveRow - j * directions[i][1]]
        && p
          === board[lastMoveRow - j * directions[i][1]][
            lastMoveColumn - j * directions[i][0]
          ]
      ) {
        matches++;
      } else {
        break;
      }
    }
    // If there are greater than three matches, then that means there are at least 4 in a row
    if (matches >= 3) {
      return true;
    }
  }
  return false;
}

import Utils from '../lib/utils';
import Game from '../models/game';
import { connectRedis } from '../lib/db';
import Validatewdrkw from '../lib/validators';
import {
  initializeBoard,
  makeMove,
  checkForVictory,
} from '../lib/connect4';

const client = connectRedis();

function _sanitizeReturn(game) {
  return {
    boardId: game.boardId,
    board: game.board,
    rows: game.rows,
    columns: game.columns,
    turn: game.turn,
    status: game.status,
    winner: game.winner,
    p1Name: game.p1Name,
    p2Name: game.p2Name,
  };
}

export default (app) => {
  const Validate = Validatewdrkw(app);
  const _return400Error = Utils.return400Error;

  app.post(
    '/create',
    [Validate.name, Validate.columns, Validate.rows],
    (req, res) => {
      const newGame = {
        p1Key: Utils.randomValueHex(25),
        p2Key: Utils.randomValueHex(25),
        boardId: Utils.randomValueHex(6),
        p1Name: req.body.name,
        board: initializeBoard(
          req.body.rows,
          req.body.columns,
        ),
        rows: req.body.rows || app.get('config').MIN_ROWS,
        columns:
          req.body.columns || app.get('config').MIN_COLUMNS,
        turn: 1,
        status: 'Game in progress',
      };

      Game.create(newGame, (err, game) => {
        if (err) return res.status(400).json(err);

        client.lpush('games', game.boardId);
        game.p2Key = undefined;
        return res.status(201).json(game);
      });
    },
  );

  app.post('/join', Validate.name, (req, res) => {
    client.rpop('games', (err, boardId) => {
      if (err) return res.status(418).json(err);

      if (!boardId) {
        return _return400Error(res, 'No games to join!');
      }

      Game.findOne({ boardId }, (err, game) => {
        if (err) return res.status(400).json(err);

        game.p2Name = req.body.name;
        game.save((err, game) => {
          if (err) return res.status(500).json(err);
          game.p1Key = undefined;
          res.status(200).json(game);
        });
      });
    });
  });

  app.get('/board/:id', (req, res) => {
    Game.findOne(
      { boardId: req.params.id },
      (err, game) => {
        if (err) return res.status(400).json(err);

        res.status(200).json(_sanitizeReturn(game));
      },
    );
  });

  app.put(
    '/board/:id',
    [Validate.move, Validate.token],
    (req, res) => {
      Game.findOne(
        { boardId: req.params.id },
        (err, game) => {
          if (!game) {
            return _return400Error(
              res,
              'Cannot find board!',
            );
          }

          if (game.status !== 'Game in progress') {
            return _return400Error(
              res,
              'Game Over. Cannot move anymore!',
            );
          }

          if (
            req.headers['x-player-token'] !== game.p1Key
            && req.headers['x-player-token'] !== game.p2Key
          ) {
            return _return400Error(
              res,
              'Wrong X-Player-Token!',
            );
          }

          const currentPlayer = game.turn % 2 === 0 ? 2 : 1;
          const currentPlayerKey = game[`p${currentPlayer}Key`];
          if (
            currentPlayerKey
            !== req.headers['x-player-token']
          ) {
            return _return400Error(
              res,
              'It is not your turn!',
            );
          }

          // Make a move, which returns a new board; returns false if the move is invalid
          const newBoard = makeMove(
            currentPlayer,
            req.body.column,
            game.board,
          );
          if (newBoard) {
            game.board = newBoard;
            game.markModified('board');
          } else {
            return _return400Error(res, 'Bad move.');
          }

          // Check if you just won
          const win = checkForVictory(
            currentPlayer,
            req.body.column,
            newBoard,
          );
          if (win) {
            game.winner = game[`p${currentPlayer}Name`];
            game.status = 'Game Over.';
          } else if (
            game.turn
            >= game.columns * game.rows
          ) {
            game.winner = 'Game ended in a tie!';
            game.status = 'Game Over.';
          }

          // Increment turns
          game.turn++;

          game.save((err, game) => {
            if (err) return res.status(500).json(err);
            return res
              .status(200)
              .json(_sanitizeReturn(game));
          });
        },
      );
    },
  );
};

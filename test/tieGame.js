import { expect } from 'chai';
import request from 'supertest';
import redis from 'redis';
import async from 'async';
import mocha from 'mocha';

import app from '../src/lib/app';

const client = redis.createClient();

const { describe, before, it } = mocha;

let p1Key;
let p2Key;
let boardId;
let rows;
let columns;

function makeMoveThunk(player, column) {
  return (done) => {
    const token = player === 1 ? p1Key : p2Key;
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', token)
      .send({ column })
      .end(done);
  };
}

describe('Simulate a tie game | ', () => {
  before((done) => {
    client.flushall((err) => {
      if (err) return done(err);
      done();
    });
  });

  it('create a game', (done) => {
    request(app)
      .post('/create')
      .send({ name: 'express' })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        p1Key = b.p1Key;
        boardId = b.boardId;
        rows = b.rows;
        columns = b.columns;
        done();
      });
  });

  it('join a game', (done) => {
    request(app)
      .post('/join')
      .send({ name: 'koa' })
      .expect(200)
      .end((err, res) => {
        p2Key = res.body.p2Key;
        done();
      });
  });

  it('Fill the board! Tie the game!', (done) => {
    const moves = [];
    let turn = 1;
    let nextMove = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= columns; c++) {
        moves.push(makeMoveThunk(turn, nextMove));
        turn = turn === 1 ? 2 : 1;
        nextMove = ((nextMove + 2) % columns) + 1;
      }
    }

    async.series(moves, (err, res) => {
      const lastResponse = res[rows * columns - 1].body;
      console.log(lastResponse);
      expect(lastResponse.winner).to.equal(
        'Game ended in a tie!',
      );
      expect(lastResponse.status).to.equal('Game Over.');
      done();
    });
  });
});

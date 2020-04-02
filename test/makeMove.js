import { expect } from 'chai';
import request from 'supertest';
import redis from 'redis';
import mocha from 'mocha';

import app from '../src/lib/app';

const client = redis.createClient();

const { describe, before, it } = mocha;

let p1Key;
let p2Key;
let boardId;

describe('Make moves | ', () => {
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
        p1Key = res.body.p1Key;
        boardId = res.body.boardId;
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

  it('Cannot move without X-Player-Token', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .send({ column: 1 })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'Missing X-Player-Token!',
        );
        done();
      });
  });

  it('Cannot move with wrong X-Player-Token', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', 'wrong token!')
      .send({ column: 1 })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'Wrong X-Player-Token!',
        );
        done();
      });
  });

  it('Cannot move on unknown board', (done) => {
    request(app)
      .put('/board/3213')
      .set('X-Player-Token', p1Key)
      .send({ column: 1 })
      .expect(404)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'Cannot find board!',
        );
        done();
      });
  });

  it('Cannot move without a column', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'Move where? Missing column!',
        );
        done();
      });
  });

  it('Cannot move outside of the board', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 18 })
      .expect(200)
      .end((err, res) => {
        expect(res.body.error).to.equal('Bad move.');
        done();
      });
  });

  it('Player 2 should not be able to move!', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .send({ column: 1 })
      .expect(400)
      .end((err, res) => {
        console.log(res.body);
        expect(res.body.error).to.equal(
          'It is not your turn!',
        );
        done();
      });
  });

  it('Player 1 can move', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 1 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.p1Key).to.be.an('undefined');
        expect(b.p2Key).to.be.an('undefined');
        expect(b.turn).to.equal(2);
        expect(b.board[b.rows - 1][0]).to.equal('x');
        done();
      });
  });

  it('Player 1 should not be able to move!', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 1 })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'It is not your turn!',
        );
        done();
      });
  });

  it('Player 2 can move', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .send({ column: 1 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.p1Key).to.be.an('undefined');
        expect(b.p2Key).to.be.an('undefined');
        expect(b.turn).to.equal(3);
        expect(b.board[b.rows - 2][0]).to.equal('o');
        done();
      });
  });

  it('Player 1 can move', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 1 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(4);
        expect(b.board[b.rows - 3][0]).to.equal('x');
        done();
      });
  });

  it('Player 2 can move', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .send({ column: 1 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(5);
        expect(b.board[b.rows - 4][0]).to.equal('o');
        done();
      });
  });

  it('Player 1 can move', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 1 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(6);
        expect(b.board[b.rows - 5][0]).to.equal('x');
        done();
      });
  });

  it('Player 2 can move', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .send({ column: 1 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(7);
        expect(b.board[b.rows - 6][0]).to.equal('o');
        done();
      });
  });

  it('Player 1 cannot move anymore on column 1', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 1 })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.equal('Bad move.');
        done();
      });
  });

  it('Player 1 can move in column 2', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 2 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(8);
        expect(b.board[b.rows - 1][1]).to.equal('x');
        done();
      });
  });

  it('Player 2 follows player 1', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .send({ column: 2 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(9);
        expect(b.board[b.rows - 2][1]).to.equal('o');
        done();
      });
  });

  it('Player 1 moves in column 3... going for the strike', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 3 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(10);
        expect(b.board[b.rows - 1][2]).to.equal('x');
        done();
      });
  });

  it('Player 2 does not see it! Greedily gets his Connect 3', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .send({ column: 3 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.turn).to.equal(11);
        expect(b.board[b.rows - 2][2]).to.equal('o');
        done();
      });
  });

  it('Player 1 makes the winning move!', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 4 })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.winner).to.equal('express');
        expect(b.status).to.equal('Game Over.');
        expect(b.turn).to.equal(12);
        expect(b.board[b.rows - 1][0]).to.equal('x');
        expect(b.board[b.rows - 1][1]).to.equal('x');
        expect(b.board[b.rows - 1][2]).to.equal('x');
        expect(b.board[b.rows - 1][3]).to.equal('x');
        done();
      });
  });

  it('Player 1 can double-check victory', (done) => {
    request(app)
      .get(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.winner).to.equal('express');
        expect(b.status).to.equal('Game Over.');
        done();
      });
  });

  it('Player 2 is a loser, to be sure', (done) => {
    request(app)
      .get(`/board/${boardId}`)
      .set('X-Player-Token', p2Key)
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.winner).to.equal('express');
        expect(b.status).to.equal('Game Over.');
        done();
      });
  });

  it('Player 1 cannot move anymore', (done) => {
    request(app)
      .put(`/board/${boardId}`)
      .set('X-Player-Token', p1Key)
      .send({ column: 3 })
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'Game Over. Cannot move anymore!',
        );
        done();
      });
  });
});

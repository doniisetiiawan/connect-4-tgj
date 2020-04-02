import { expect } from 'chai';
import redis from 'redis';
import mocha from 'mocha';
import request from 'supertest';

import app from '../src/lib/app';

const { describe, before, it } = mocha;
const client = redis.createClient();

describe('Create and join new game | ', () => {
  before((done) => {
    client.flushall((err) => {
      if (err) return done(err);
      done();
    });
  });

  it('should not be able to join a game without a name', (done) => {
    request(app)
      .post('/join')
      .expect(400)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'Must provide name field!',
        );
        done();
      });
  });

  it('should not be able to join a game if none exists', (done) => {
    request(app)
      .post('/join')
      .send({ name: 'koa' })
      .expect(418)
      .end((err, res) => {
        expect(res.body.error).to.equal(
          'No games to join!',
        );
        done();
      });
  });

  it('should create a game and add it to the queue', (done) => {
    request(app)
      .post('/create')
      .send({ name: 'express' })
      .expect(200)
      .end(() => {
        done();
      });
  });

  it('should join the game on the queue', (done) => {
    request(app)
      .post('/join')
      .send({ name: 'koa' })
      .expect(200)
      .end((err, res) => {
        const b = res.body;
        expect(b.boardId).to.be.a('string');
        expect(b.p1Key).to.be.an('undefined');
        expect(b.p1Name)
          .to.be.a('string')
          .and.equal('express');
        expect(b.p2Key).to.be.a('string');
        expect(b.p2Name)
          .to.be.a('string')
          .and.equal('koa');
        expect(b.turn)
          .to.be.a('number')
          .and.equal(1);
        expect(b.rows).to.be.a('number');
        expect(b.columns).to.be.a('number');
        done();
      });
  });
});

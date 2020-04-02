import mongoose from 'mongoose';
import redis from 'redis';
import url from 'url';

export function connectMongoDB() {
  mongoose.connect(
    'mongodb://localhost/connect-4-tgj',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        return console.log(
          'Mongoose - connection error:',
          err,
        );
      }
    },
  );

  return mongoose;
}

export function connectRedis() {
  const urlRedisToGo = process.env.REDISTOGO_URL;
  let client;

  if (urlRedisToGo) {
    console.log('using redistogo');
    const rtg = url.parse(urlRedisToGo);
    client = redis.createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(':')[1]);
  } else {
    console.log('using local redis');
    client = redis.createClient();
  }

  return client;
}

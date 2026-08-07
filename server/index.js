const app = require('./app');
const connectDB = require('./db/connect');
const config = require('./config/config');

const start = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
  };

  ['SIGTERM', 'SIGINT'].forEach((signal) => process.on(signal, () => shutdown(signal)));
};

start();

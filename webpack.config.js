module.exports = (env) => {
  if (env && env.prod) {
    return require('./webpack.prod.js');
  } else {
    return require('./webpack.dev.js');
  }
};
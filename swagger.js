
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TweetAI API',
      version: '1.0.0',
      description: 'API documentation for the TweetAI backend',
    },
    servers: [
      {
        url: 'http://localhost:2000',
        description: 'Local server',
      },
    ],
  },
  apis: ['./index.js'], 
});

module.exports = {
  swaggerUi,
  swaggerSpec,
};

import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Notes App API',
    description: 'Dokumentasi API untuk Technical Test Fullstack Engineer',
    version: '1.0.0',
  },
  host: 'localhost:5000',
  schemes: ['http', 'https'],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Masukkan token dengan format: Bearer <token>',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/server.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
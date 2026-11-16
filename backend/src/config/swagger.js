const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgroSmart API Documentation',
      version: '1.0.0',
      description: 'Documentación interactiva de la API REST del sistema AgroSmart con autenticación JWT y RBAC',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
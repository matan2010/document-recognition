import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipe with transform enabled
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Configure body parsers
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true }));
  
  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`, {
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
  

   // Graceful shutdown
   const signals = ['SIGTERM', 'SIGINT'];
   for (const signal of signals) {
     process.on(signal, async () => {
       console.log(`Received ${signal}, closing application...`);
       await app.close();
       process.exit(0);
     });
   }

  // Listen on the specified port
  const port = process.env.PORT || 8000;
  console.log(`Application starting on port ${port}`);
  await app.listen(port);
}

bootstrap();

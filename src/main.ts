// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

// ✅ Swagger imports
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ⚠️ If already added in AppModule, REMOVE from here
  app.useGlobalInterceptors(new TransformInterceptor());

  // ✅ Global Exception Handler
  app.useGlobalFilters(new AllExceptionsFilter());

  // ✅ CORS
  app.enableCors();

  // 🔥 SWAGGER SETUP (IMPORTANT)
  const config = new DocumentBuilder()
    .setTitle('Finance Dashboard API')
    .setDescription('Backend API for Finance Management System')
    .setVersion('1.0')
    .addBearerAuth() // 🔐 for JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // 🚀 Start server
  await app.listen(3000);

  console.log('🚀 Server running on http://localhost:3000');
  console.log('📘 Swagger docs at http://localhost:3000/api');
}

bootstrap();
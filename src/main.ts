import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Utf8Interceptor } from './utils/utf8.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://191.252.214.36:3000',
      'http://genesis.vps-kinghost.net:3000',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new Utf8Interceptor());

  await app.listen(4000, '0.0.0.0');
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Utf8Interceptor } from './utils/utf8.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
      'http://191.252.214.36:4000',
      'http://genesis.vps-kinghost.net',
      'https://genesis.vps-kinghost.net',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new Utf8Interceptor());

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}

bootstrap();

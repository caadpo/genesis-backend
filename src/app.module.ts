import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateModule } from './state/state.module';
import { CityModule } from './city/city.module';
import { AddressModule } from './address/address.module';
import { CacheCustomModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { MasterModule } from './master/master.module';
import { PjesEventoModule } from './pjesevento/pjesevento.module';
import { OmeModule } from './ome/ome.module';
import { DiretoriaModule } from './diretoria/diretoria.module';
import { PjesOperacaoModule } from './pjesoperacao/pjesoperacao.module';
import { PjesescalaModule } from './pjesescala/pjesescala.module';
import { PjestetoModule } from './pjesteto/pjesteto.module';
import { AuxiliarModule } from './auxiliar/auxiliar.module';
import { DpoModule } from './dpo/dpo.module';
import { PjesDistModule } from './pjesdist/pjesdist.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { DadosSgpModule } from './dadossgp/dadossgp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      entities: [`${__dirname}/**/*.entity{.js,.ts}`],
      migrations: [`${__dirname}/migration/{.ts,*.js}`],
      migrationsRun: true,
    }),
    UserModule,
    StateModule,
    CityModule,
    AddressModule,
    CacheCustomModule,
    AuthModule,
    JwtModule,
    MasterModule,
    PjesEventoModule,
    OmeModule,
    DiretoriaModule,
    PjesOperacaoModule,
    PjesescalaModule,
    PjestetoModule,
    AuxiliarModule,
    DpoModule,
    PjesDistModule,
    DadosSgpModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import * as pino from 'pino';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // for loading environment variables from .env files
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      useFactory: () => {
        return {
          pinoHttp: {
            level: 'trace',
            useLevelLabels: true,
            transport:
              process.env.NODE_ENV === 'local'
                ? { target: 'pino-pretty' }
                : undefined,
            serializers: {
              err: pino.stdSerializers.err,
              req: pino.stdSerializers.req,
              res: pino.stdSerializers.res,
            },
            redact: ['req.headers.authorization'],
          },
        };
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

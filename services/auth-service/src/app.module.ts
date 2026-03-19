import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Account } from './auth/entities/account.entity';
import { UserProfile } from './auth/entities/user-profile.entity';
import { Conversation } from './auth/entities/conversation.entity';
import { Message } from './auth/entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST ?? '34.21.133.54',
      port: Number(process.env.DB_PORT ?? 1433),
      username: process.env.DB_USERNAME ?? 'sa',
      password: process.env.DB_PASSWORD ?? 'abc@XYZ1234',
      database: process.env.DB_NAME ?? 'YHCT_DB',
      entities: [Account, UserProfile, Conversation, Message],
      synchronize: false,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

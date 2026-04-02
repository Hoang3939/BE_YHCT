import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { SystemConfigModule } from './system-config/system-config.module';
import { SystemConfigEntity } from './system-config/entities/system-config.entity';
import { AuthModule } from './auth/auth.module';

const envFilePaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../.env'),
  resolve(process.cwd(), 'services/.env'),
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../../.env'),
].filter((path, index, paths) => existsSync(path) && paths.indexOf(path) === index);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? process.env.DB_DATABASE,
      entities: [SystemConfigEntity],
      synchronize: false,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
    SystemConfigModule,
  ],
})
export class AppModule {}
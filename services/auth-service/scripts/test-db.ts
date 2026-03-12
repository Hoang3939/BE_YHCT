import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Account } from '../src/auth/entities/account.entity';
import { UserProfile } from '../src/auth/entities/user-profile.entity';
import { RevokedToken } from '../src/auth/entities/revoked-token.entity';

async function run() {
  const dataSource = new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST ?? '34.21.133.54',
    port: Number(process.env.DB_PORT ?? 1433),
    username: process.env.DB_USERNAME ?? 'sa',
    password: process.env.DB_PASSWORD ?? 'abc@XYZ1234',
    database: process.env.DB_NAME ?? 'YHCT_DB',
    entities: [Account, UserProfile, RevokedToken],
    synchronize: false,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  });

  try {
    await dataSource.initialize();
    await dataSource.query('SELECT 1 AS ok');
    console.log('Database connection OK');
  } catch (error) {
    console.error('Database connection failed:', error?.message ?? error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

run();

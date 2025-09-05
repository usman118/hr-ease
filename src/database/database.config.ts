import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// Load environment variables for migrations
config();

// Single database configuration for everything
const databaseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'hr_ease',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

// For NestJS runtime (with NestJS-specific options)
export const createDatabaseConfig = (): TypeOrmModuleOptions => ({
  ...databaseConfig,
  retryDelay: 3000,
  retryAttempts: 10,
});

// For TypeORM CLI migrations (default export)
export default new DataSource(databaseConfig as DataSourceOptions);

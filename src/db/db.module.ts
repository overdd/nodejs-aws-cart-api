import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        const pool = new Pool({
          host: process.env.RDS_HOSTNAME,
          port: parseInt(process.env.RDS_PORT, 10),
          database: process.env.RDS_DB_NAME,
          user: process.env.RDS_USERNAME,
          password: process.env.RDS_PASSWORD,
          ssl: {
            rejectUnauthorized: false,
          },
        });
        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}

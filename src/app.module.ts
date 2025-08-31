import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database/database.module';
import { CompaniesModule } from '@/root/companies/companies.module';
import { JobApplicationsModule } from '@/root/job-applications/job-applications.module';
import { JobPostsModule } from '@/root/job-posts/job-posts.module';
import { UsersModule } from '@/root/users/users.module';
import { VisitorsModule } from '@/root/visitors/visitors.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Database connection
    DatabaseModule,

    // Business modules (alphabetically sorted)
    CompaniesModule,
    JobApplicationsModule,
    JobPostsModule,
    UsersModule,
    VisitorsModule,
  ],
})
export class AppModule {}

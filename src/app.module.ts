import { DatabaseModule } from '@/database/database.module';
import { AdminModule } from '@/root/admin/admin.module';
import { AuthModule } from '@/root/auth/auth.module';
import { CompaniesModule } from '@/root/companies/companies.module';
import { CompanyOwnerModule } from '@/root/company-owner/company-owner.module';
import { JobApplicationsModule } from '@/root/job-applications/job-applications.module';
import { JobPostsModule } from '@/root/job-posts/job-posts.module';
import { ProfileModule } from '@/root/profile/profile.module';
import { UsersModule } from '@/root/users/users.module';
import { VisitorsModule } from '@/root/visitors/visitors.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Database connection
    DatabaseModule,

    // Business modules (alphabetically sorted)
    AdminModule,
    AuthModule,
    CompaniesModule,
    CompanyOwnerModule,
    JobApplicationsModule,
    JobPostsModule,
    ProfileModule,
    UsersModule,
    VisitorsModule,
  ],
})
export class AppModule {}

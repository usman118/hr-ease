import { CompanyHr } from '@/entities/company-hr.entity';
import { Company } from '@/entities/company.entity';
import { JobApplication } from '@/entities/job-application.entity';
import { JobPost } from '@/entities/job-post.entity';
import { User } from '@/entities/user.entity';
import { Visitor } from '@/entities/visitor.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobApplication,
      JobPost,
      Visitor,
      User,
      Company,
      CompanyHr,
    ]),
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}

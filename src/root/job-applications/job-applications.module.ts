import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';
import { JobApplication } from '@/entities/job-application.entity';
import { JobPost } from '@/entities/job-post.entity';
import { Visitor } from '@/entities/visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobApplication, JobPost, Visitor])],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}

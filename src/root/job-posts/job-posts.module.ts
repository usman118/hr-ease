import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';
import { JobPost } from '@/entities/job-post.entity';
import { Company } from '@/entities/company.entity';
import { CompanyHr } from '@/entities/company-hr.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, Company, CompanyHr])],
  controllers: [JobPostsController],
  providers: [JobPostsService],
  exports: [JobPostsService],
})
export class JobPostsModule {}

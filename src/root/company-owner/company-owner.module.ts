import { CompanyHr } from '@/entities/company-hr.entity';
import { Company } from '@/entities/company.entity';
import { User } from '@/entities/user.entity';
import { ServicesModule } from '@/services/services.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyOwnerController } from './company-owner.controller';
import { CompanyOwnerService } from './company-owner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company, CompanyHr]),
    ServicesModule,
  ],
  controllers: [CompanyOwnerController],
  providers: [CompanyOwnerService],
  exports: [CompanyOwnerService],
})
export class CompanyOwnerModule {}

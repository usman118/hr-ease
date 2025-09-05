import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { Visitor } from '@/entities/visitor.entity';
import { VisitorHelper } from '@/helpers/visitor.helper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
  ) {}

  async create(createVisitorDto: CreateVisitorDto): Promise<Visitor> {
    return VisitorHelper.createVisitor(
      this.visitorRepository,
      createVisitorDto,
    );
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    lazy: boolean = false,
  ): Promise<PaginatedResponse<Visitor>> {
    const queryBuilder = this.visitorRepository
      .createQueryBuilder('visitor')
      .orderBy('visitor.createdAt', 'DESC');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(visitor.firstName ILIKE :search OR visitor.lastName ILIKE :search OR visitor.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // If lazy loading is enabled, return all records without pagination
    if (lazy) {
      const visitors = await queryBuilder.getMany();
      return {
        data: visitors,
        total: visitors.length,
        page: 1,
        limit: visitors.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [visitors, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: visitors,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findOne(id: string): Promise<Visitor> {
    return VisitorHelper.findVisitorById(this.visitorRepository, id);
  }

  async update(
    id: string,
    updateVisitorDto: UpdateVisitorDto,
  ): Promise<Visitor> {
    return VisitorHelper.updateVisitor(
      this.visitorRepository,
      id,
      updateVisitorDto,
    );
  }

  async remove(id: string): Promise<void> {
    return VisitorHelper.softDeleteVisitor(this.visitorRepository, id);
  }
}

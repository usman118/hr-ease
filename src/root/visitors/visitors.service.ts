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

  async findAll(): Promise<Visitor[]> {
    return this.visitorRepository.find();
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

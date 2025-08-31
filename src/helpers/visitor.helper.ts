import { Visitor } from '@/entities/visitor.entity';
import { CreateVisitorDto } from '@/root/visitors/dto/create-visitor.dto';
import { UpdateVisitorDto } from '@/root/visitors/dto/update-visitor.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

export class VisitorHelper {
  /**
   * Validate visitor email uniqueness
   */
  static async validateEmailUniqueness(
    visitorRepo: Repository<Visitor>,
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const existingVisitor = await visitorRepo.findOne({
      where: { email },
      withDeleted: true,
    });

    if (existingVisitor && existingVisitor.id !== excludeId) {
      throw new ConflictException('Email already exists');
    }
  }

  /**
   * Find visitor by ID with proper error handling
   */
  static async findVisitorById(
    visitorRepo: Repository<Visitor>,
    id: string,
  ): Promise<Visitor> {
    const visitor = await visitorRepo.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }
    return visitor;
  }

  /**
   * Create visitor with validation
   */
  static async createVisitor(
    visitorRepo: Repository<Visitor>,
    createVisitorDto: CreateVisitorDto,
  ): Promise<Visitor> {
    // Validate email uniqueness
    await this.validateEmailUniqueness(visitorRepo, createVisitorDto.email);

    const visitor = visitorRepo.create(createVisitorDto);
    return visitorRepo.save(visitor);
  }

  /**
   * Update visitor with validation
   */
  static async updateVisitor(
    visitorRepo: Repository<Visitor>,
    id: string,
    updateVisitorDto: UpdateVisitorDto,
  ): Promise<Visitor> {
    const visitor = await this.findVisitorById(visitorRepo, id);

    // Validate email uniqueness if email is being updated
    if (updateVisitorDto.email) {
      await this.validateEmailUniqueness(
        visitorRepo,
        updateVisitorDto.email,
        id,
      );
    }

    Object.assign(visitor, updateVisitorDto);
    return visitorRepo.save(visitor);
  }

  /**
   * Soft delete visitor
   */
  static async softDeleteVisitor(
    visitorRepo: Repository<Visitor>,
    id: string,
  ): Promise<void> {
    const visitor = await this.findVisitorById(visitorRepo, id);
    await visitorRepo.softRemove(visitor);
  }

  /**
   * Find visitor by email
   */
  static async findVisitorByEmail(
    visitorRepo: Repository<Visitor>,
    email: string,
  ): Promise<Visitor | null> {
    return visitorRepo.findOne({ where: { email } });
  }

  /**
   * Format visitor display name
   */
  static getVisitorDisplayName(visitor: Visitor): string {
    return `${visitor.firstName} ${visitor.lastName}`;
  }

  /**
   * Get visitor contact info
   */
  static getVisitorContactInfo(visitor: Visitor): {
    name: string;
    email: string;
    telephone?: string;
  } {
    return {
      name: this.getVisitorDisplayName(visitor),
      email: visitor.email,
      telephone: visitor.telephone,
    };
  }

  /**
   * Search visitors by name or email
   */
  static async searchVisitors(
    visitorRepo: Repository<Visitor>,
    searchTerm: string,
  ): Promise<Visitor[]> {
    return visitorRepo
      .createQueryBuilder('visitor')
      .where('visitor.firstName ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('visitor.lastName ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('visitor.email ILIKE :search', { search: `%${searchTerm}%` })
      .getMany();
  }
}

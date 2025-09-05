import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { Visitor } from '@/entities/visitor.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { VisitorsService } from './visitors.service';

@ApiTags('visitors')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all visitors with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'lazy',
    required: false,
    type: Boolean,
    description: 'Load all records at once (ignores pagination)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated visitors',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('lazy') lazy?: string,
  ): Promise<PaginatedResponse<Visitor>> {
    const isLazy = lazy === 'true';
    return this.visitorsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      isLazy,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get visitor by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Visitor UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the visitor',
    type: Visitor,
  })
  @ApiResponse({ status: 404, description: 'Visitor not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Visitor> {
    return this.visitorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new visitor' })
  @ApiBody({ type: CreateVisitorDto })
  @ApiResponse({
    status: 201,
    description: 'Visitor created successfully',
    type: Visitor,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createVisitorDto: CreateVisitorDto): Promise<Visitor> {
    return this.visitorsService.create(createVisitorDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update visitor by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Visitor UUID' })
  @ApiBody({ type: UpdateVisitorDto })
  @ApiResponse({
    status: 200,
    description: 'Visitor updated successfully',
    type: Visitor,
  })
  @ApiResponse({ status: 404, description: 'Visitor not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVisitorDto: UpdateVisitorDto,
  ): Promise<Visitor> {
    return this.visitorsService.update(id, updateVisitorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete visitor by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Visitor UUID' })
  @ApiResponse({ status: 200, description: 'Visitor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Visitor not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.visitorsService.remove(id);
    return { message: 'Visitor deleted successfully' };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { Visitor } from '@/entities/visitor.entity';

@ApiTags('visitors')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all visitors' })
  @ApiResponse({
    status: 200,
    description: 'Returns all visitors',
    type: [Visitor],
  })
  findAll(): Promise<Visitor[]> {
    return this.visitorsService.findAll();
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

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ShippersService } from './shippers.service';
import { CreateShipperDto, UpdateShipperDto } from './dto/shipper.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Shippers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shippers')
export class ShippersController {
  constructor(private shippersService: ShippersService) {}

  @Get()
  findAll() {
    return this.shippersService.findAll();
  }

  @Get('cod-orders')
  getCodOrders(@Query('reconciled') reconciled?: string) {
    const parsed =
      reconciled === 'true' ? true : reconciled === 'false' ? false : undefined;
    return this.shippersService.getCodOrders(parsed);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateShipperDto) {
    return this.shippersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShipperDto) {
    return this.shippersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippersService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { CreateDebtPaymentDto } from './dto/debt.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private debtsService: DebtsService) {}

  @Get()
  findAll() {
    return this.debtsService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.debtsService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtsService.findOne(id);
  }

  @Get(':id/payments')
  getPaymentHistory(@Param('id') id: string) {
    return this.debtsService.getPaymentHistory(id);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() dto: CreateDebtPaymentDto) {
    return this.debtsService.addPayment(id, dto);
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.statisticsService.getDashboard();
  }

  @Get('revenue-by-day')
  getRevenueByDay(@Query('days') days?: string) {
    return this.statisticsService.getRevenueByDay(days ? parseInt(days) : 30);
  }

  @Get('revenue-by-month')
  getRevenueByMonth(@Query('months') months?: string) {
    return this.statisticsService.getRevenueByMonth(
      months ? parseInt(months) : 12,
    );
  }

  @Get('top-customers')
  getTopCustomers(@Query('limit') limit?: string) {
    return this.statisticsService.getTopCustomers(
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('revenue-by-source')
  getRevenueBySource() {
    return this.statisticsService.getRevenueBySource();
  }
}

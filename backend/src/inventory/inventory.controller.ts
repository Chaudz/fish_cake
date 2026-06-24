import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { UpdateInventorySettingDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  getInventory() {
    return this.inventoryService.getInventory();
  }

  @Get('settings')
  getSettings() {
    return this.inventoryService.getSettings();
  }

  @Put('settings')
  updateSetting(@Body() dto: UpdateInventorySettingDto) {
    return this.inventoryService.updateSetting(dto);
  }
}

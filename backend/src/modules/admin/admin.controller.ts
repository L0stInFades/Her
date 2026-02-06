import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { UpsertAiModelDto } from './dto/upsert-model.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('bootstrap')
  async bootstrapAdmin(@GetUser() user: any, @Body() dto: BootstrapAdminDto) {
    const result = await this.adminService.bootstrapAdmin(user.id, dto.token);
    return { success: true, data: result };
  }

  @Get('config')
  @Roles('ADMIN')
  async getConfig() {
    const data = await this.adminService.getConfig();
    return { success: true, data };
  }

  @Put('config')
  @Roles('ADMIN')
  async updateConfig(@Body() dto: UpdateAppConfigDto) {
    const config = await this.adminService.updateConfig(dto);
    return { success: true, data: config };
  }

  @Get('models')
  @Roles('ADMIN')
  async listModels() {
    const models = await this.adminService.listModels();
    return { success: true, data: models };
  }

  @Post('models')
  @Roles('ADMIN')
  async createOrUpdateModel(@Body() dto: UpsertAiModelDto) {
    const model = await this.adminService.upsertModel(dto);
    return { success: true, data: model };
  }

  @Patch('models/:id/default')
  @Roles('ADMIN')
  async setDefault(@Param('id') id: string) {
    const result = await this.adminService.setDefaultModel(id);
    return { success: true, data: result };
  }

  @Delete('models/:id')
  @Roles('ADMIN')
  async deleteModel(@Param('id') id: string) {
    const result = await this.adminService.deleteModel(id);
    return { success: true, data: result };
  }
}

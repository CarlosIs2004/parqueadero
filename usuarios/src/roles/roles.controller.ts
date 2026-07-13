import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  Inject,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { IRolesService } from './interfaces/roles-service.interface';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResponseRoleDto } from './dto/response-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'root')
@Controller('roles')
export class RolesController {
  constructor(
    @Inject('IRolesService')
    private readonly rolesService: IRolesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un rol' })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: ResponseRoleDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: el nombre del rol ya existe',
  })
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.rolesService.create(createRoleDto, ip, createRoleDto.mac, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles',
    type: [ResponseRoleDto],
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado',
    type: ResponseRoleDto,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado',
    type: ResponseRoleDto,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.rolesService.update(id, updateRoleDto, ip, updateRoleDto.mac, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (soft delete) un rol' })
  @ApiResponse({ status: 200, description: 'Rol desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.rolesService.softDelete(id, ip, undefined, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Delete(':id/hard')
  @Roles('root')
  @ApiOperation({ summary: 'Eliminar físicamente un rol (root)' })
  @ApiResponse({ status: 200, description: 'Rol eliminado físicamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  hardRemove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.rolesService.hardDelete(id, ip, undefined, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }
}

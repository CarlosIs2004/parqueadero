import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { IUserRoleService } from './interfaces/user-role-service.interface';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Asignación Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'root')
@Controller('user-role')
export class UserRoleController {
  constructor(
    @Inject('IUserRoleService')
    private readonly userRoleService: IUserRoleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Asignar un rol a un usuario' })
  @ApiResponse({ status: 201, description: 'Rol asignado exitosamente' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: la asignación ya existe',
  })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.userRoleService.assignRole(assignRoleDto);
  }

  @Delete(':idUser/:idRole')
  @ApiOperation({ summary: 'Remover asignación de rol (soft delete)' })
  @ApiResponse({ status: 200, description: 'Asignación removida exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  removeRole(
    @Param('idUser', ParseUUIDPipe) idUser: string,
    @Param('idRole', ParseUUIDPipe) idRole: string,
  ) {
    return this.userRoleService.removeRole(idUser, idRole);
  }

  @Delete(':idUser/:idRole/hard')
  @Roles('root')
  @ApiOperation({ summary: 'Eliminar físicamente asignación (root)' })
  @ApiResponse({ status: 200, description: 'Asignación eliminada físicamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  hardRemoveRole(
    @Param('idUser', ParseUUIDPipe) idUser: string,
    @Param('idRole', ParseUUIDPipe) idRole: string,
  ) {
    return this.userRoleService.hardDelete(idUser, idRole);
  }

  @Get('user/:idUser')
  @ApiOperation({ summary: 'Obtener roles asignados a un usuario' })
  @ApiResponse({ status: 200, description: 'Lista de roles del usuario' })
  findRolesByUser(@Param('idUser', ParseUUIDPipe) idUser: string) {
    return this.userRoleService.findRolesByUser(idUser);
  }

  @Get('role/:idRole')
  @ApiOperation({ summary: 'Obtener usuarios que tienen un rol' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios con ese rol' })
  findUsersByRole(@Param('idRole', ParseUUIDPipe) idRole: string) {
    return this.userRoleService.findUsersByRole(idRole);
  }
}

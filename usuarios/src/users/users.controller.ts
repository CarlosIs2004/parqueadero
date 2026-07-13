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
import * as bcrypt from 'bcrypt';
import type { IUsersService } from './interfaces/users-service.interface';
import type { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'root')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('IUsersService')
    private readonly usersService: IUsersService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: ResponseUserDto,
  })
  @ApiResponse({ status: 409, description: 'Conflicto: username ya existe' })
  create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.usersService.create(createUserDto, ip, createUserDto.mac, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [ResponseUserDto],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: ResponseUserDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: ResponseUserDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const data: Partial<User> = {};
    if (updateUserDto.username !== undefined)
      data.username = updateUserDto.username;
    if (updateUserDto.password !== undefined) {
      const salt = await bcrypt.genSalt();
      data.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.usersService.update(id, data, ip, updateUserDto.mac, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar (soft delete) un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.usersService.softDelete(id, ip, undefined, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Delete(':id/hard')
  @Roles('root')
  @ApiOperation({ summary: 'Eliminar físicamente un usuario (root)' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado físicamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  hardRemove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.usersService.hardDelete(id, ip, undefined, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }
}

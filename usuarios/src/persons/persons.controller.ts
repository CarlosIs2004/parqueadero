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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import type { IPersonsService } from './interfaces/persons-service.interface';
import { CreatePersonUseCase } from './use-cases/create-person.usecase';
import { CreatePersonDto } from './dto/create-person.dto';
import { CreatePersonOnlyDto } from './dto/create-person-only.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { ResponsePersonDto } from './dto/response-person.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Personas')
@Controller('persons')
export class PersonsController {
  constructor(
    private readonly createPersonUseCase: CreatePersonUseCase,
    @Inject('IPersonsService')
    private readonly personsService: IPersonsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una persona con su usuario (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Persona y usuario creados exitosamente',
    type: ResponsePersonDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: DNI, email o username ya existen',
  })
  create(@Body() createPersonDto: CreatePersonDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.createPersonUseCase.execute(createPersonDto, ip, createPersonDto.mac, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Post('only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear solo una persona sin usuario (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Persona creada exitosamente',
    type: ResponsePersonDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: DNI o email ya existen',
  })
  createOnly(@Body() createPersonOnlyDto: CreatePersonOnlyDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.personsService.createOnlyPerson(createPersonOnlyDto, ip, undefined, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi perfil (cliente autenticado)' })
  @ApiResponse({
    status: 200,
    description: 'Datos de la persona autenticada',
    type: ResponsePersonDto,
  })
  findMe(@Req() req: Request) {
    const user = req.user as { idPerson: string };
    return this.personsService.findOne(user.idPerson);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar mi perfil (cliente autenticado)' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado',
    type: ResponsePersonDto,
  })
  updateMe(@Req() req: Request, @Body() updatePersonDto: UpdatePersonDto) {
    const user = req.user as { idPerson: string; username: string; roles: string[] };
    const ip = ((req.headers['x-forwarded-for'] as string as string) || req.ip || '').split(',')[0].trim();
    return this.personsService.update(user.idPerson, updatePersonDto, ip, updatePersonDto.mac, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las personas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de personas',
    type: [ResponsePersonDto],
  })
  findAll() {
    return this.personsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una persona por ID (solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Persona encontrada',
    type: ResponsePersonDto,
  })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una persona por ID (solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Persona actualizada',
    type: ResponsePersonDto,
  })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePersonDto: UpdatePersonDto,
    @Req() req: any,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.personsService.update(id, updatePersonDto, ip, updatePersonDto.mac, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar (soft delete) una persona (solo admin)' })
  @ApiResponse({ status: 200, description: 'Persona desactivada exitosamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.personsService.softDelete(id, ip, undefined, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('root')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar físicamente una persona (root)' })
  @ApiResponse({ status: 200, description: 'Persona eliminada físicamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  hardRemove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const user = req.user as { username: string; roles: string[] } | undefined;
    return this.personsService.hardDelete(id, ip, undefined, user?.username, (user?.roles?.find(r => r !== 'cliente') || user?.roles?.[0] || ''));
  }
}

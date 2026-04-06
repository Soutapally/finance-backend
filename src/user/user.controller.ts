//anages user-related operations including registration, role management,
//and profile access with strict role-based authorization.
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from './user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @ApiOperation({
  summary: 'Register new user',
})
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // Only ADMIN & ANALYST can view all users (VIEWER cannot)
  @Get()
  @ApiOperation({
  summary: 'Get all users',
  description: 'Admin & Analyst only',
})
  @Roles(Role.ADMIN, Role.ANALYST)
  async findAll(@Query() queryDto: QueryUsersDto) {
    return this.userService.findAll(queryDto);
  }

  // Any authenticated user can view their own profile
  @Get('me')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  async getMe(@CurrentUser('id') userId: string) {
    return this.userService.findOne(userId);
  }

  // Only ADMIN & ANALYST can view specific user
  @Get(':id')
  @Roles(Role.ADMIN, Role.ANALYST)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  // Only ADMIN can update users
 @Patch(':id/role')
@Roles(Role.ADMIN)
async updateRole(
  @Param('id', ParseUUIDPipe) id: string,
  @Body('role') role: Role,
) {
  return this.userService.update(id, { role });
}

  // Only ADMIN can deactivate users
  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.deactivate(id);
  }

  // Only ADMIN can activate users
  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.activate(id);
  }

  // Only ADMIN can delete users
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.softDelete(id);
  }
}
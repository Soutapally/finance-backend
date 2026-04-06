//Implements core user management logic including registration, updates,
//role handling, and lifecycle control with validation and security checks.
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { User, Role } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}


async create(dto: CreateUserDto): Promise<UserResponseDto> {
  const existing = await this.userRepo.findOne({
    where: { email: dto.email },
  });

  if (existing) {
    throw new ConflictException('Email already exists');
  }

  const user = new User();
  user.name = dto.name;
  user.email = dto.email;
  user.password = dto.password;

 
  user.role = Role.VIEWER;

  const savedUser = await this.userRepo.save(user);

  const response = new UserResponseDto();
  response.id = savedUser.id;
  response.name = savedUser.name;
  response.email = savedUser.email;
  response.role = savedUser.role;
  response.isActive = savedUser.isActive;
  response.isDeleted = savedUser.isDeleted;
  response.lastLoginAt = savedUser.lastLoginAt;
  response.createdAt = savedUser.createdAt;
  response.updatedAt = savedUser.updatedAt;

  return response;
}

  async findAll(queryDto: QueryUsersDto): Promise<{ data: Partial<User>[]; total: number }> {
    const { page = 1, limit = 10, search, role, isActive } = queryDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User> = { isDeleted: false };
    
    if (search) {
      where.name = ILike(`%${search}%`);
    }
    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.userRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt', 'lastLoginAt'],
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false },
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt', 'lastLoginAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email, isDeleted: false },
      select: ['id', 'name', 'email', 'password', 'role', 'isActive', 'isDeleted'],
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

   
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ 
        where: { email: dto.email } 
      });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password !== undefined) user.password = dto.password;

    const updated = await this.userRepo.save(user);
    
    const { password, ...result } = updated;
    return result;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, { lastLoginAt: new Date() });
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    

    if (user.role === Role.ADMIN) {
      const adminCount = await this.userRepo.count({ 
        where: { role: Role.ADMIN, isActive: true, isDeleted: false } 
      });
      if (adminCount === 1 && user.isActive === true) {
        throw new BadRequestException('Cannot deactivate the only active admin');
      }
    }

    await this.userRepo.update(id, { isActive: false });
    return { message: 'User deactivated successfully' };
  }

  async activate(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.userRepo.update(id, { isActive: true });
    return { message: 'User activated successfully' };
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    
    
    if (user.role === Role.ADMIN) {
      const adminCount = await this.userRepo.count({ 
        where: { role: Role.ADMIN, isDeleted: false } 
      });
      if (adminCount === 1) {
        throw new BadRequestException('Cannot delete the only admin');
      }
    }

    await this.userRepo.update(id, { isDeleted: true, isActive: false });
    return { message: 'User deleted successfully' };
  }
}
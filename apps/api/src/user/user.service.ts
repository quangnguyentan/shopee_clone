import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/base.service';
import { PaginationDto } from '@/base/base.dto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SessionsService } from '@/session/session.service';

const managedUserFields = [
  'id',
  'email',
  'name',
  'phone',
  'avatar',
  'role',
  'status',
  'two_factor_enabled',
  'created_at',
  'updated_at',
] as const;

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly sessionsService: SessionsService,
  ) {
    super(userRepo);
  }

  async getMe(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: String(userId) },
      select: ['id', 'email', 'name', 'role', 'avatar', 'status'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createManagedUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email is already in use');

    const user = this.userRepo.create({
      email,
      password_hash: await bcrypt.hash(dto.password, 12),
      name: dto.name.trim(),
      phone: dto.phone?.trim() || undefined,
      role: dto.role,
      status: dto.status ?? (dto.role === 'seller' ? 'PENDING' : 'ACTIVE'),
      auth_provider: 'local',
      email_verified: true,
    });

    const saved = await this.userRepo.save(user);
    return this.findManagedUser(saved.id);
  }

  async findManagedUsers(
    query: PaginationDto,
    role?: 'buyer' | 'seller' | 'admin',
  ) {
    if (role && !['buyer', 'seller', 'admin'].includes(role)) {
      throw new BadRequestException('Invalid user role filter');
    }
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 100);
    const builder = this.userRepo
      .createQueryBuilder('user')
      .select(managedUserFields.map((field) => `user.${field}`))
      .orderBy('user.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (role) builder.andWhere('user.role = :role', { role });

    const [items, total] = await builder.getManyAndCount();
    return { items, total, page, limit };
  }

  async findManagedUser(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: [...managedUserFields],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateManagedUser(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'admin' && dto.status !== undefined) {
      throw new ForbiddenException(
        'Admin account status is managed through the super-admin workflow',
      );
    }

    const previousStatus = user.status;
    Object.assign(user, dto);
    await this.userRepo.save(user);
    if (previousStatus === 'ACTIVE' && user.status !== 'ACTIVE') {
      await this.sessionsService.revokeAll(user.id);
    }
    return this.findManagedUser(id);
  }

  async deleteManagedUser(id: string, actorUserId: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    if (user.id === String(actorUserId) || user.role === 'admin') {
      throw new ForbiddenException('This account cannot be deleted');
    }
    if (user.role === 'seller') {
      throw new ForbiddenException('Suspend seller accounts instead of deleting them');
    }

    await this.userRepo.softDelete(id);
    await this.sessionsService.revokeAll(user.id);
    return { success: true, id };
  }
}

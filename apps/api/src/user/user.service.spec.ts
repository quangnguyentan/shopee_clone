import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SessionsService } from '@/session/session.service';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService management', () => {
  const userRepo = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const sessionsService = { revokeAll: jest.fn() };
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(
      userRepo as unknown as Repository<User>,
      sessionsService as unknown as SessionsService,
    );
  });

  it('revokes active sessions when an account is suspended', async () => {
    userRepo.findOneBy.mockResolvedValue({
      id: 'seller-1',
      role: 'seller',
      status: 'ACTIVE',
    });
    userRepo.save.mockResolvedValue(undefined);
    userRepo.findOne.mockResolvedValue({
      id: 'seller-1',
      status: 'SUSPENDED',
    });

    await service.updateManagedUser('seller-1', { status: 'SUSPENDED' });

    expect(sessionsService.revokeAll).toHaveBeenCalledWith('seller-1');
  });

  it('keeps admin status changes in the super-admin workflow', async () => {
    userRepo.findOneBy.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
      status: 'ACTIVE',
    });

    await expect(
      service.updateManagedUser('admin-1', { status: 'SUSPENDED' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('updates only the current user profile fields', async () => {
    userRepo.findOneBy.mockResolvedValue({
      id: 'buyer-1',
      name: 'Old name',
      phone: '',
    });
    userRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'buyer-1',
        email: 'buyer@example.com',
        name: 'New name',
        phone: '0912345678',
        gender: 'female',
        date_of_birth: '1998-06-15',
      });

    await expect(
      service.updateMyProfile(1, {
        name: 'New name',
        phone: '0912345678',
        gender: 'female',
        date_of_birth: '1998-06-15',
        gender: 'female',
        date_of_birth: '1998-06-15',
      }),
    ).resolves.toMatchObject({
      id: 'buyer-1',
      name: 'New name',
      phone: '0912345678',
    });
    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'buyer-1',
        name: 'New name',
        phone: '0912345678',
        gender: 'female',
        date_of_birth: '1998-06-15',
      }),
    );
  });
});

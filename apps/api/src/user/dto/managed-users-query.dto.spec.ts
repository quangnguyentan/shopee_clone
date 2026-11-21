import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ManagedUsersQueryDto } from './managed-users-query.dto';

describe('ManagedUsersQueryDto', () => {
  it('accepts role alongside pagination filters', async () => {
    const query = plainToInstance(ManagedUsersQueryDto, {
      page: '1',
      limit: '100',
      role: 'seller',
    });

    await expect(validate(query)).resolves.toHaveLength(0);
    expect(query.page).toBe(1);
    expect(query.limit).toBe(100);
    expect(query.role).toBe('seller');
  });

  it('rejects unsupported roles', async () => {
    const query = plainToInstance(ManagedUsersQueryDto, { role: 'owner' });

    await expect(validate(query)).resolves.toHaveLength(1);
  });
});

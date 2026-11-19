import { ExecutionContext } from '@nestjs/common';
import {
  OptionalJwtAuthGuard,
  OptionalSessionGuard,
} from './optional-auth.guard';

function createContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('optional authentication guards', () => {
  it('allows requests without an access-token cookie', () => {
    const guard = new OptionalJwtAuthGuard();
    const context = createContext({
      headers: {},
      cookies: {},
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows anonymous requests through the session check', async () => {
    const guard = Object.create(
      OptionalSessionGuard.prototype,
    ) as OptionalSessionGuard;
    const context = createContext({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});

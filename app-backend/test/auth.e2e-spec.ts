import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User, AuditLog, EmailVerificationToken } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let db: {
    users: (User & { role?: { name: string } })[];
    auditLogs: AuditLog[];
    emailTokens: EmailVerificationToken[];
  };

  beforeAll(async () => {
    db = {
      users: [],
      auditLogs: [],
      emailTokens: [],
    };

    const mockPrismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => {
          if (where.email) {
            return db.users.find((u) => u.email === where.email) || null;
          }
          if (where.id) {
            return db.users.find((u) => u.id === where.id) || null;
          }
          return null;
        }),
        findFirst: jest.fn().mockImplementation(async ({ where }) => {
          if (where.email) {
            return db.users.find((u) => u.email === where.email) || null;
          }
          return null;
        }),

        create: jest.fn().mockImplementation(async ({ data }) => {
          const newUser = {
            id: Math.random().toString(),
            ...data,
            failedLoginAttempts: 0,
            isActive: true,
            role: { name: 'CUSTOMER' },
          };
          db.users.push(newUser);
          return newUser;
        }),
        update: jest.fn().mockImplementation(async ({ where, data }) => {
          const userIndex = db.users.findIndex((u) => u.id === where.id);
          if (userIndex === -1) {
            throw new Error('User not found');
          }

          if (data.failedLoginAttempts?.increment) {
            db.users[userIndex].failedLoginAttempts += data.failedLoginAttempts.increment;
          } else if (data.failedLoginAttempts !== undefined) {
            db.users[userIndex].failedLoginAttempts = data.failedLoginAttempts;
          }

          if (data.lockedUntil !== undefined) {
            db.users[userIndex].lockedUntil = data.lockedUntil;
          }
          if (data.refreshTokenHash !== undefined) {
            db.users[userIndex].refreshTokenHash = data.refreshTokenHash;
          }

          return db.users[userIndex];
        }),
      },
      auditLog: {
        create: jest.fn().mockImplementation(async ({ data }) => {
          db.auditLogs.push(data);
          return data;
        }),
      },
      emailVerificationToken: {
        create: jest.fn().mockImplementation(async ({ data }) => {
          db.emailTokens.push(data);
          return data;
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    phone: '1234567890',
  };

  let accessToken: string;
  let refreshToken: string;

  it('/api/auth/register (POST) -> 201', async () => {
    const res = await request(app.getHttpServer()).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('/api/auth/register (POST) -> 409 on duplicate', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(testUser).expect(409);
  });

  it('/api/auth/login (POST) -> 401 on bad password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword!' })
      .expect(401);
  });

  it('/api/auth/login (POST) -> 200 with token pair', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('/api/auth/login (POST) -> 429 on locked account', async () => {
    const user = db.users.find((u) => u.email === testUser.email);
    user!.lockedUntil = new Date(Date.now() + 10000);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(429);

    user!.lockedUntil = null;
  });

  it('/api/auth/me (GET) -> 401 without token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('/api/auth/me (GET) -> 200 with valid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it('/api/auth/refresh (POST) -> 200 with new token pair', async () => {
    // Wait 1 second so the new token gets a different 'iat' (issued at) timestamp
    await new Promise((r) => setTimeout(r, 1000));

    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('/api/auth/refresh (POST) -> 401 on reused token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer invalid-or-reused-token`)
      .send({})
      .expect(401);
  });

  it('/api/auth/logout (POST) -> 204', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(204);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .send({})
      .expect(401);
  });
});

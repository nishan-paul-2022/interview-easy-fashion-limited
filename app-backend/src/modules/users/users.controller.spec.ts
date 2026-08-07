import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@/modules/users/users.controller';
import { UsersService } from '@/modules/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('should throw ForbiddenException on self-deactivation', async () => {
      await expect(controller.updateStatus('1', { isActive: false }, { id: '1' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      service.findById.mockResolvedValue(null as never);
      await expect(controller.updateStatus('1', { isActive: false }, { id: '2' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update status successfully', async () => {
      service.findById.mockResolvedValue({ id: '1' } as never);
      service.updateStatus.mockResolvedValue({ id: '1', isActive: false } as never);

      const result = await controller.updateStatus('1', { isActive: false }, { id: '2' });

      expect(result.isActive).toBe(false);
      expect(service.updateStatus).toHaveBeenCalledWith('1', false);
    });
  });
});

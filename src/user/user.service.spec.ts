import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserEntity } from "../../entities/user.entity";
import { DataSource, IsNull, Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

describe("UserService", () => {
  let userService: UserService;
  let userRepository: Partial<Record<keyof Repository<UserEntity>, jest.Mock>>;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { ...userRepository },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe("getUser", () => {
    const mockUser = {
      userType: "GENERAL",
      id: 2,
      userUuid: "a8b06ba9-5461-4113-b295-222d3ec6b731",
      name: "조다솜",
      email: "quizrix@codnut.com",
      password: "$2b$10$JZJKUSbXFSUM5yF38YEsKuAZ/wGQXL7jwguWyf.Qjyf4cA85eKQVq",
      createdDt: "2024-02-16T16:06:56.000Z",
      updatedDt: "2025-08-17T13:55:59.000Z",
      deletedDt: null,
    };

    it("success getUser", async () => {
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await userService.getUser({ email: "quizrix@codnut.com" });

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: "quizrix@codnut.com",
          deletedDt: IsNull(),
        },
      });
    });

    it("not exist email by user", async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        userService.getUser({ email: "test@email.com" }),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: "test@email.com",
          deletedDt: IsNull(),
        },
      });
    });
  });

  describe("createUser", () => {
    const dto: CreateUserDTO = {
      name: "유저이름",
      email: "email@email.com",
      password: "password",
      userType: "general",
    };

    it("success createUser", async () => {
      userRepository.findOne!.mockResolvedValueOnce(null);
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const mockUser = {
        ...dto,
        password: hashedPassword,
        userType: dto.userType.toUpperCase(),
        userUuid: "mock-uuid",
      };

      userRepository.create!.mockReturnValue(mockUser);
      userRepository.save!.mockResolvedValue(mockUser);

      const result = await userService.createUser(mockUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        userUuid: "mock-uuid",
        email: dto.email,
        userType: "GENERAL",
        password: expect.any(String),
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it("ConflictException if already existed email", async () => {
      userRepository.findOne!.mockResolvedValue({ email: dto.email });

      await expect(userService.createUser(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});

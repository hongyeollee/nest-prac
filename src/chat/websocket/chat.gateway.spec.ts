import { Test, TestingModule } from "@nestjs/testing";
import { ChatGateway } from "./chat.gateway";
import { ChatRoomService } from "../service/chat-room.service";
import { ChatMessageService } from "../service/chat-message.service";
import { ChatEventService } from "../service/chat-event.service";
import { WsJwtGuard } from "../guards/ws-jwt.guard";
import { JwtService } from "@nestjs/jwt";

describe("ChatGateway", () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        WsJwtGuard,
        {
          provide: ChatRoomService,
          useValue: { getActiveMemberOrThrow: jest.fn() },
        },
        {
          provide: ChatMessageService,
          useValue: { createMessage: jest.fn() },
        },
        {
          provide: ChatEventService,
          useValue: { bindServer: jest.fn() },
        },
        { provide: JwtService, useValue: { verify: jest.fn() } },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});

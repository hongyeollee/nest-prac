import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CouponIssuedLogEntity } from "entities/coupons/coupon-issued-log.entity";
import { DataSource } from "typeorm";
import { CreateCouponIssueByUserDTO } from "../_dto/create-coupon-issue-by-user.dto";
import { UserService } from "src/user/user.service";
import { CouponService } from "../coupon.service";
import { ResponseCommonSuccessDTO } from "src/_common/_dto/common-success-response.dto";
import { CouponEntity } from "entities/coupons/coupon.entity";
import { Payload } from "src/auth/security/user.payload.interface";
import { CreateLimitCouponIssueByUserDTO } from "../_dto/create-limit-coupon-issue-by-user.dto";
import { CouponIssuedEntity } from "entities/coupons/coupon-issued.entity";

@Injectable()
export class CouponIssuedService {
  constructor(
    private readonly dataSource: DataSource,

    private readonly userService: UserService,
    private readonly couponService: CouponService,
  ) {}

  /**
   * 일반 쿠폰 발행
   * @param createCouponIssueByUserDto
   * @returns
   */
  async createCouponIssueByUser(
    createCouponIssueByUserDto: CreateCouponIssueByUserDTO,
    user: Payload,
  ): Promise<ResponseCommonSuccessDTO> {
    const { couponId } = createCouponIssueByUserDto;

    if (!user) throw new NotFoundException("not existed user");

    const coupon = await this.couponService.findOneById(couponId);

    if (!coupon) throw new NotFoundException("not existed coupon");
    if (!coupon.isActive)
      throw new BadRequestException("coupon is not active.");
    if (coupon.isPeriodLimited) {
      const now = new Date();
      if (now < coupon.startedDt || now > coupon.endedDt) {
        throw new BadRequestException("coupon is out of valid period.");
      }
    }
    if (coupon.isIssuedLimited || coupon.totalCount !== null) {
      throw new BadRequestException("coupon is limited");
    }

    const expiredDt = coupon.isPeriodLimited ? coupon.endedDt : null;

    return this.dataSource.transaction(async (manager) => {
      try {
        //couponIssue에서 IGNORE로 에러로그 발생시키지 않게하기 위해 쿼리로 작성함
        const couponIssue = await manager.query(
          "INSERT IGNORE INTO `coupon_issued` (`userId`,`couponId`,`isUsed`,`expiredDt`) VALUES (?,?,?,?)",
          [user.id, coupon.id, false, expiredDt],
        );

        // 중복이면 영향 0 (에러로그 없이 예외처리)
        if ((couponIssue?.affectedRows ?? 0) === 0) {
          await this.dataSource.manager.insert(CouponIssuedLogEntity, {
            userId: user.id,
            couponId: coupon.id,
            action: "already",
          });
          throw new ConflictException("Already issued");
        }

        await manager.insert(CouponIssuedLogEntity, {
          userId: user.id,
          couponId: coupon.id,
          action: "issued",
        });

        await manager.increment(
          CouponEntity,
          { id: coupon.id },
          "issuedCount",
          1,
        );

        return {
          message: "success",
          statusCode: HttpStatus.CREATED,
        };
      } catch (error) {
        // 위에서 던진 애들은 그대로
        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException ||
          error instanceof ConflictException
        )
          throw error;

        throw new InternalServerErrorException("fail issue coupon");
      }
    });
  }

  async createLimitCouponIssueByUser(
    createLimitCouponIssueByUser: CreateLimitCouponIssueByUserDTO,
    user: Payload,
  ) {
    const { couponId } = createLimitCouponIssueByUser;

    if (!user) throw new NotFoundException("not existed user");

    const coupon = await this.couponService.findOneById(couponId);

    if (!coupon) throw new NotFoundException("not existed coupon");
    if (!coupon.isActive)
      throw new BadRequestException("coupon is not active.");
    if (coupon.isPeriodLimited) {
      const now = new Date();
      if (now < coupon.startedDt || now > coupon.endedDt) {
        throw new BadRequestException("coupon is out of valid period.");
      }
    }
    if (!coupon.isIssuedLimited || coupon.totalCount === null) {
      throw new BadRequestException("coupon is not limited");
    }

    const expiredDt = coupon.isPeriodLimited ? coupon.endedDt : null;

    return await this.dataSource.transaction(
      "READ COMMITTED",
      async (manager) => {
        try {
          //couponIssue에서 IGNORE로 에러로그 발생시키지 않게하기 위해 쿼리로 작성함
          const couponIssue = await manager.query(
            "INSERT IGNORE INTO `coupon_issued` (`userId`,`couponId`,`isUsed`,`expiredDt`) VALUES (?,?,?,?)",
            [user.id, coupon.id, false, expiredDt],
          );

          // 중복이면 영향 0 (에러로그 없이 예외처리)
          if ((couponIssue?.affectedRows ?? 0) === 0) {
            await this.dataSource.manager.insert(CouponIssuedLogEntity, {
              userId: user.id,
              couponId: coupon.id,
              action: "already",
            });
            throw new ConflictException("Already issued");
          }

          const updateRes = await manager
            .createQueryBuilder()
            .update(CouponEntity)
            .set({ issuedCount: () => "issuedCount + 1" })
            .where("id = :id", { id: coupon.id })
            .andWhere("totalCount IS NOT NULL")
            .andWhere("issuedCount < totalCount")
            .execute();

          // 품절 → 보상 삭제 + 로그(outside tx) + 400
          if (updateRes.affected !== 1) {
            await manager
              .createQueryBuilder()
              .delete()
              .from(CouponIssuedEntity)
              .where("userId = :userId AND couponId = :couponId", {
                userId: user.id,
                couponId: coupon.id,
              })
              .execute();
            await this.dataSource.manager.insert(CouponIssuedLogEntity, {
              userId: user.id,
              couponId: coupon.id,
              action: "soldout",
            });
            throw new BadRequestException("sold out");
          }

          await manager.insert(CouponIssuedLogEntity, {
            userId: user.id,
            couponId: coupon.id,
            action: "issued",
          });

          return {
            message: "success",
            statusCode: HttpStatus.CREATED,
          };
        } catch (error) {
          if (
            error instanceof BadRequestException &&
            error.message === "sold out"
          ) {
            await this.dataSource.manager.insert(CouponIssuedLogEntity, {
              userId: user.id,
              couponId: coupon.id,
              action: "soldout",
            });
            throw error;
          }

          if (
            error instanceof BadRequestException ||
            error instanceof NotFoundException ||
            error instanceof ConflictException
          )
            throw error;

          throw new InternalServerErrorException("fail issue coupon");
        }
      },
    );
  }

  async getMyCoupons(user: Payload, page: number = 1, limit: number = 10) {
    const couponsIssued = this.dataSource
      .getRepository(CouponIssuedEntity)
      .createQueryBuilder("ci")
      .innerJoinAndSelect("ci.coupon", "c")
      .where("ci.userId = :userId", { userId: user.id })
      .orderBy("ci.issuedDt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, totalCount] = await couponsIssued.getManyAndCount();

    const coupon = rows.map((el) => {
      return {
        issuedId: el.id,
        isUsed: el.isUsed,
        expiredDt: el.expiredDt ? el.expiredDt.toISOString() : null,
        couponId: el.coupon.id,
        code: el.coupon.code,
        name: el.coupon.name,
        minPrice: el.coupon.minPrice,
        discountType: el.coupon.discountType,
        discountValue: el.coupon.discountValue,
        isActive: el.coupon.isActive,
        startedDt: el.coupon.startedDt
          ? el.coupon.startedDt.toDateString()
          : null,
        endedDt: el.coupon.endedDt ? el.coupon.endedDt.toDateString() : null,
      };
    });

    return {
      coupons: coupon,
      totalCount,
      currPage: page,
      totalPage: Math.ceil(totalCount / limit),
    };
  }
}

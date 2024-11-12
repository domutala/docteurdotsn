import { Order } from "database/entitys/Order";
import { DataSource, Repository } from "typeorm";
import { Inject, Injectable } from "@nestjs/common";
import { Plan } from "database/entitys/Plan";
import * as dayjs from "dayjs";
import { OrganizationRepository } from "./Organization";

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  @Inject() private organizationRepository: OrganizationRepository;

  async _create(params: Partial<Order>) {
    let order: Order;
    if (params.id) order = await this._findOne({ id: params.id });
    if (!order) order = new Order();

    order.id = params.id;
    order.offer = params.offer;
    order.paypalOrder = params.paypalOrder;
    order.createBy = params.createBy;
    order.organization = params.organization;

    await order.save();

    // Créer un plan
    if (order.paypalOrder.status === "COMPLETED") {
      const plan = new Plan();
      plan.order = order;
      plan.organization = order.organization;

      plan.startdAt = new Date();

      const lastPlan = this.organizationRepository._findClosestFuturePlan(
        plan.organization,
      );
      if (lastPlan && dayjs(lastPlan.endAt).isAfter(new Date())) {
        lastPlan.startdAt = lastPlan.endAt;
      }

      plan.endAt = dayjs(plan.startdAt)
        .add(order.offer.duration, "months")
        .toDate();

      await plan.save();
    }

    return order;
  }

  async _findOne(params: { [x: string]: any }) {
    if (
      Object.values(params)
        .map((v) => v !== undefined)
        .includes(false)
    ) {
      return;
    }

    const sessions = await this._find(params);

    return sessions[0];
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("order");
    queryBuilder.leftJoinAndSelect("order.organization", "organization");
    queryBuilder.leftJoinAndSelect("organization.plans", "plans");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids && params.ids.length) {
      queryBuilder.andWhere(
        `order.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    queryBuilder.orderBy("order.createdAt", "ASC");

    const sessions = await queryBuilder.getMany();

    return sessions;
  }
}

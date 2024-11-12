import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Base } from "./Base";
import { Organization } from "./Organization";
import { Order } from "./Order";

export interface Offer {
  code: string;
  duration: number;
  amount: number;
}

@Entity()
export class Plan extends Base {
  @ManyToOne(() => Organization, (organization) => organization.orders)
  organization: Organization;

  @OneToOne(() => Order, (order) => order.plan)
  @JoinColumn()
  order: Order;

  @Column({ type: "timestamp" })
  startdAt: Date;

  @Column({ type: "timestamp" })
  endAt: Date;
}

import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { Base } from "./Base";
import { Organization } from "./Organization";
import { Offer, Plan } from "./Plan";

@Entity()
export class Order extends Base {
  @Column({ type: "json" })
  offer: Offer;

  @Column({ type: "json" })
  paypalOrder: { id: string; status: string };

  @Column({ type: "varchar" })
  createBy: string;

  @ManyToOne(() => Organization, (organization) => organization.orders)
  organization: Organization;

  @OneToOne(() => Plan, (plan) => plan.order)
  plan: Plan;
}

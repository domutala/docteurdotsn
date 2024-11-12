import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Base } from "./Base";
import { Model } from "./Model";
import { Order } from "./Order";
import { Plan } from "./Plan";

export type MemberState =
  | "invited"
  | "disabled"
  | "accepted"
  | "declined"
  | "leave";

@Entity()
export class Organization extends Base {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  owner: string;

  @OneToMany(() => Model, (model) => model.organization)
  models: Model[];

  @OneToMany(() => Order, (order) => order.organization)
  orders: Order[];

  @OneToMany(() => Plan, (plan) => plan.organization)
  plans: Plan[];

  @Column({ type: "json", default: "[]" })
  members: {
    uid: string;
    admin?: boolean;
    state: MemberState;
    owner?: boolean;
  }[];
}

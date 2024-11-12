import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";

@Entity()
export class Session extends Base {
  @Column({ type: "boolean", default: false })
  closed: boolean;

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;
}

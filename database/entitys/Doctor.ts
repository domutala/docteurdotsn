import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";
import { IsEmail } from "class-validator";

@Entity()
export class Doctor extends Base {
  @IsEmail({}, { message: "email_is_not_valid" })
  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  firstName: string;

  @Column({ type: "varchar" })
  lastName: string;

  @OneToOne(() => User, (user) => user.doctor)
  user: User;
}

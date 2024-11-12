import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Base } from "./Base";
import { Doctor } from "./Doctor";
import { Session } from "./Session";

export const regexPaswword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~\-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~\-]{8,}$/;

@Entity()
export class User extends Base {
  @Column({ type: "varchar" })
  email: string;

  // @Matches(regexPaswword, { message: "password_is_not_valid" })
  @Column({ type: "json", nullable: true })
  password: { value: string | string[] };

  @Column({ type: "boolean", default: false })
  confirmed: boolean;

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  @JoinColumn()
  doctor: Doctor;

  @OneToMany(() => Session, (photo) => photo.user)
  sessions: Session[];
}

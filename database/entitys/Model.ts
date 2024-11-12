import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Base } from "./Base";
import { Organization } from "./Organization";
import { Input } from "./Input";

@Entity()
export class Model extends Base {
  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "json", nullable: true })
  logo: any;

  @Column({ type: "json", default: [] })
  schemaOptions: any[];

  @Column({ type: "json", nullable: true })
  base: any;

  @Column({ type: "json", nullable: true })
  metas: any;

  @Column({ type: "json", default: {} })
  interfaces: any;

  @ManyToOne(() => Organization, (organization) => organization.models)
  organization: Organization;

  @Column({ type: "varchar" })
  createBy: string;

  @OneToMany(() => Input, (input) => input.model)
  inputs: Input[];
}

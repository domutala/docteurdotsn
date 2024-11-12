import { Column, Entity, OneToOne } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// export interface IFile {
//   name: string;
//   type: string;
//   size: number;
//   content: string;
// }

export class IFile {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsInt()
  size: number;

  @IsString()
  content: string;
}

@Entity()
export class Doctor extends Base {
  @IsEmail({}, { message: "email_is_not_valid" })
  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  @IsString({ message: "firstName_incorrect" })
  firstName: string;

  @Column({ type: "varchar" })
  @IsString({ message: "lastName_incorrect" })
  lastName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => IFile)
  @Column({ type: "json", nullable: true })
  photo?: IFile;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString({ message: "description_incorrect" })
  description?: string;

  @Column({ type: "varchar", nullable: true })
  @IsOptional()
  @IsString({ message: "specialty_incorrect" })
  specialty: string;

  @Column({ type: "varchar", nullable: true, unique: true })
  @IsString({ message: "username_incorrect" })
  username: string;

  @OneToOne(() => User, (user) => user.doctor)
  user: User;
}

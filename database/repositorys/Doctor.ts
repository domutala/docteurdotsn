import { Doctor } from "database/entitys/Doctor";
import { Injectable, NotAcceptableException } from "@nestjs/common";
import { BaseRepository } from "./Base";
import { DataSource } from "typeorm";

@Injectable()
export class DoctorRepository extends BaseRepository<Doctor> {
  constructor(dataSource: DataSource) {
    super(dataSource, Doctor);
  }

  async _register(params: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    if (await this._findOne({ email: params.email })) {
      throw new NotAcceptableException("doctor_with_email_already_registered");
    }

    const doctor = new Doctor();

    doctor.email = params.email;
    doctor.firstName = params.firstName;
    doctor.lastName = params.lastName;

    await doctor.save();
    return doctor;
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("doctor");
    // queryBuilder.leftJoinAndSelect("doctor.model", "model");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids) {
      queryBuilder.andWhere(
        `doctor.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    if (params.email) {
      params.emails ||= [];
      params.emails.push(params.email);
    }
    if (params.emails) {
      queryBuilder.andWhere(
        `doctor.email IN (${params.emails.map((email: string) => `'${email}'`).join(",")})`,
      );
    }

    const doctors = await queryBuilder.getMany();

    return doctors;
  }
}

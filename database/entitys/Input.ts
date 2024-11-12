import { Column, Entity, ManyToOne } from "typeorm";
import { Base } from "./Base";
import { Model } from "./Model";

@Entity()
export class Input extends Base {
  @Column({ type: "json", default: "{}" })
  values: { [x: string]: any };

  @ManyToOne(() => Model, (model) => model.inputs)
  model: Model;
}

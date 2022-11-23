import { Column, Entity, PrimaryColumn, Repository } from "typeorm";
import { Schedule } from "../../../shared/model/schedule";

@Entity()
export class ScheduleTable {
  @PrimaryColumn()
  id: string;

  @Column()
  owner: string;

  @Column()
  title: string;

  @Column()
  createdAt: number;

  static fromModel(model: Schedule): ScheduleTable {
    const table = new ScheduleTable();
    table.id = model.id;
    table.owner = model.owner;
    table.title = model.title;
    table.createdAt = model.createdAt;

    return table;
  }

  toModel(): Schedule {
    return {
      id: this.id,
      owner: this.owner,
      title: this.title,
      createdAt: this.createdAt,
    };
  }
}

export const newScheduleRepository = (db: Repository<ScheduleTable>) => {
  return {
    create: async (model: Schedule) => {
      return db.insert(ScheduleTable.fromModel(model));
    },
  };
};

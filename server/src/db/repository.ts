import { Column, Entity, PrimaryColumn } from "typeorm";
import { Repository } from "../model/repository";

@Entity()
export class RepositoryTable {
  @PrimaryColumn()
  id: string;

  @Column()
  owner: string;

  @Column()
  name: string;

  static fromModel(model: Repository): RepositoryTable {
    const record = new RepositoryTable();
    record.id = model.id;
    record.owner = model.owner;
    record.name = model.name;

    return record;
  }

  toModel(): Repository {
    return {
      id: this.id,
      owner: this.owner,
      name: this.name,
    };
  }
}

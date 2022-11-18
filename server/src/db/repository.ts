import { Column, Entity, PrimaryColumn } from "typeorm";
import { Repository } from "../../../shared/model/repository";

@Entity()
export class RepositoryTable {
  @PrimaryColumn()
  id: string;

  @Column()
  owner: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  defaultBranchName?: string;

  static fromModel(model: Repository): RepositoryTable {
    const record = new RepositoryTable();
    record.id = model.id;
    record.owner = model.owner;
    record.name = model.name;
    record.defaultBranchName = model.defaultBranchName;

    return record;
  }

  toModel(): Repository {
    return {
      id: this.id,
      owner: this.owner,
      name: this.name,
      defaultBranchName: this.defaultBranchName,
    };
  }
}

import { Column, Entity, In, PrimaryColumn } from "typeorm";
import { Repository } from "../../../shared/model/repository";
import { Repository as OrmRepository } from "typeorm";

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

export const newRepositoryRepository = (db: OrmRepository<RepositoryTable>) => {
  return {
    findOneBy: async (where: { id: string }) => {
      const r = await db.findOneBy(where);

      return r?.toModel();
    },
    findBy: async (where: { ids?: string[]; owner: string[] }) => {
      const r = await db.findBy({
        id: where.ids ? In(where.ids) : undefined,
        owner: In(where.owner),
      });

      return r.map((r) => r.toModel());
    },
    save: async (model: Repository) => {
      return db.save(RepositoryTable.fromModel(model));
    },
  };
};

import { Column, Entity, PrimaryColumn } from "typeorm";
import { Commit } from "../model/commit";

@Entity()
export class CommitTable {
  @PrimaryColumn()
  id: string;

  @Column()
  oid: string;

  @Column()
  url: string;

  @Column()
  message: string;

  @Column()
  createdBy: string;

  @Column()
  committedDate: string;

  static fromModel(model: Commit): CommitTable {
    const record = new CommitTable();
    record.id = model.id;
    record.oid = model.oid;
    record.url = model.url;
    record.message = model.message;
    record.createdBy = model.createdBy;
    record.committedDate = model.committedDate;

    return record;
  }

  toModel(): Commit {
    return {
      id: this.id,
      oid: this.oid,
      url: this.url,
      message: this.message,
      createdBy: this.createdBy,
      committedDate: this.committedDate,
    };
  }
}

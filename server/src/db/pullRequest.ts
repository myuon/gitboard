import { Column, Entity, PrimaryColumn } from "typeorm";
import { PullRequest } from "../model/pullRequest";

@Entity()
export class PullRequestTable {
  @PrimaryColumn()
  id: string;

  @Column()
  number: number;

  @Column()
  title: string;

  @Column()
  state: string;

  @Column()
  url: string;

  @Column()
  createdBy: string;

  @Column()
  closedAt?: string;

  static fromModel(model: PullRequest): PullRequestTable {
    const record = new PullRequestTable();
    record.id = model.id;
    record.number = model.number;
    record.title = model.title;
    record.state = model.state;
    record.url = model.url;
    record.createdBy = model.createdBy;
    record.closedAt = model.closedAt;

    return record;
  }

  toModel(): PullRequest {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      state: this.state,
      url: this.url,
      createdBy: this.createdBy,
      closedAt: this.closedAt,
    };
  }
}

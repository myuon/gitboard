import { Entity, OneToOne, PrimaryColumn, Repository } from "typeorm";
import { CommitPullRequestRelation } from "../../../shared/model/commitPullRequstRelation";
import { CommitTable } from "./commit";
import { PullRequestTable } from "./pullRequest";

@Entity()
export class CommitPullRequestRelationTable {
  @OneToOne(() => CommitTable)
  @PrimaryColumn()
  commitId: string;

  @OneToOne(() => PullRequestTable)
  @PrimaryColumn()
  pullRequestId: string;

  static fromModel(
    model: CommitPullRequestRelation
  ): CommitPullRequestRelationTable {
    const record = new CommitPullRequestRelationTable();
    record.commitId = model.commitId;
    record.pullRequestId = model.pullRequestId;

    return record;
  }

  toModel(): CommitPullRequestRelation {
    return {
      commitId: this.commitId,
      pullRequestId: this.pullRequestId,
    };
  }
}

export const newCommitPullRequestRelationRepository = (
  db: Repository<CommitPullRequestRelationTable>
) => {
  return {
    save: async (model: CommitPullRequestRelation) => {
      return db.save(CommitPullRequestRelationTable.fromModel(model));
    },
  };
};

import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { IBallotPaperRepository, QueryKey } from '../interfaces';
import { BallotPaper, LastEvaluatedKey } from '../../types';
import { Repository } from './Repository';
import { v4 as uuid } from 'uuid';
import { BallotPaperItem } from '../../models/core/BallotPaper';
import { beginsWith, ConditionExpression, EqualityExpressionPredicate, equals } from '@aws/dynamodb-expressions';

export class BallotPaperRepository extends Repository implements IBallotPaperRepository {

	public async getAllByElection(electionId: string, lastEvaluatedKey?: LastEvaluatedKey):
		Promise<{ ballotPapers: BallotPaper[]; lastEvaluatedKey: LastEvaluatedKey }> {
		const keyCondition: QueryKey = {
			entity: 'ballotPaper',
			sk2: `election#${electionId}`
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10
		};

		const queryPages: QueryPaginator<BallotPaperItem> = this.db.query(BallotPaperItem, keyCondition, queryOptions).pages();
		const ballotPapers: BallotPaper[] = [];
		for await (const page of queryPages) for (const ballotPaper of page) ballotPapers.push(ballotPaper);
		return {
			ballotPapers,
			lastEvaluatedKey: queryPages.lastEvaluatedKey ? queryPages.lastEvaluatedKey : undefined
		};
	}

	public async getAllByVoter(userId: string, voted?: boolean, lastEvaluatedKey?: LastEvaluatedKey):
		Promise<{ ballotPapers: BallotPaper[]; lastEvaluatedKey: LastEvaluatedKey }> {
		const predicate: EqualityExpressionPredicate = equals(voted);

		const equalsExpression: ConditionExpression = {
			...predicate,
			subject: 'voted'
		};

		const keyCondition: QueryKey = {
			entity: 'ballotPaper',
			sk3: beginsWith(`user#${userId}`)
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk3-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10
		};

		if (voted !== undefined) queryOptions.filter = equalsExpression;

		const queryPages: QueryPaginator<BallotPaperItem> = this.db.query(BallotPaperItem, keyCondition, queryOptions).pages();
		const ballotPapers: BallotPaper[] = [];
		for await (const page of queryPages) for (const ballotPaper of page) ballotPapers.push(ballotPaper);
		return {
			ballotPapers,
			lastEvaluatedKey: queryPages.lastEvaluatedKey ? queryPages.lastEvaluatedKey : undefined
		};
	}

	public async getByElectionVoter(userId: string, electionId: string): Promise<BallotPaper> {
		const keyCondition: QueryKey = {
			entity: 'ballotPaper',
			sk3: `user#${userId}/election#${electionId}`,
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk3-index',
			scanIndexForward: false,
			// startKey: lastEvaluatedKey,
			limit: 10
		};

		const queryPages: QueryPaginator<BallotPaperItem> = this.db.query(BallotPaperItem, keyCondition, queryOptions).pages();
		const ballotPapers: BallotPaper[] = [];
		for await (const page of queryPages) for (const ballotPaper of page) ballotPapers.push(ballotPaper);
		return ballotPapers[0];
	}

	public async getAllByElectionCandidate(electionId: string, candidateId: string, lastEvaluatedKey?: LastEvaluatedKey):
		Promise<{ ballotPapers: BallotPaper[]; lastEvaluatedKey: LastEvaluatedKey }> {
		const predicate: EqualityExpressionPredicate = equals(candidateId);

		const expression: ConditionExpression = {
			...predicate,
			subject: 'voteCandidateId'
		};

		const keyCondition: QueryKey = {
			entity: 'ballotPaper',
			sk2: `election#${electionId}`
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10,
			filter: expression
		};

		const queryPages: QueryPaginator<BallotPaperItem> = this.db.query(BallotPaperItem, keyCondition, queryOptions).pages();
		const ballotPapers: BallotPaper[] = [];
		for await (const page of queryPages) for (const ballotPaper of page) ballotPapers.push(ballotPaper);
		return {
			ballotPapers,
			lastEvaluatedKey: queryPages.lastEvaluatedKey ? queryPages.lastEvaluatedKey : undefined
		};
	}

	public async get(ballotPaperId: string, userId: string): Promise<BallotPaper> {
		return this.db.get(Object.assign(new BallotPaperItem(), {
			pk: `ballotPaper#${ballotPaperId}`,
			sk: `user#${userId}`
		}));
	}

	public async create(ballotPaper: Partial<BallotPaper>): Promise<BallotPaper> {
		const ballotPaperId: string = uuid();
		const date: string = new Date().toISOString();

		ballotPaper.ballotPaperId = ballotPaperId;
		ballotPaper.voted = false;

		return this.db.put(Object.assign(new BallotPaperItem(), {
			pk: `ballotPaper#${ballotPaper.ballotPaperId}`,
			sk: `user#${ballotPaper.userId}`,
			sk2: `election#${ballotPaper.electionId}`,
			sk3: `user#${ballotPaper.userId}/election#${ballotPaper.electionId}`,
			entity: 'ballotPaper',
			times: {
				createdAt: date
			},
			...ballotPaper
		}));
	}

	public async update(ballotPaper: Partial<BallotPaper>): Promise<BallotPaper> {
		delete ballotPaper.sk2;
		delete ballotPaper.sk3;

		return this.db.update(Object.assign(new BallotPaperItem(), {
			pk: `ballotPaper#${ballotPaper.ballotPaperId}`,
			sk: `user#${ballotPaper.userId}`,
			...ballotPaper
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(ballotPaperId: string, userId: string): Promise<BallotPaper | undefined> {
		return this.db.delete(Object.assign(new BallotPaperItem(), {
			pk: `ballotPaper#${ballotPaperId}`,
			sk: `user#${userId}`
		}), {
			returnValues: 'ALL_OLD'
		});
	}

}

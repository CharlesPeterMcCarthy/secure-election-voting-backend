import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { QueryKey, IElectionRepository } from '../interfaces';
import { Election, LastEvaluatedKey } from '../../types';
import { Repository } from './Repository';
import { v4 as uuid } from 'uuid';
import { ElectionItem } from '../../models/core/Election';
import { ConditionExpression, EqualityExpressionPredicate, equals } from '@aws/dynamodb-expressions';

export class ElectionRepository extends Repository implements IElectionRepository {

	public async get(electionId: string): Promise<Election> {
		return this.db.get(Object.assign(new ElectionItem(), {
			pk: `election#${electionId}`,
			sk: `election#${electionId}`
		}));
	}

	public async getAll(electionFinished?: boolean, lastEvaluatedKey?: LastEvaluatedKey):
		Promise<{ elections: Election[]; lastEvaluatedKey: LastEvaluatedKey }> {
		const predicate: EqualityExpressionPredicate = equals(electionFinished);

		const equalsExpression: ConditionExpression = {
			...predicate,
			subject: 'electionFinished'
		};

		const keyCondition: QueryKey = {
			entity: 'election'
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10
		};

		if (electionFinished !== undefined) queryOptions.filter = equalsExpression;

		const queryPages: QueryPaginator<ElectionItem> = this.db.query(ElectionItem, keyCondition, queryOptions).pages();
		const elections: Election[] = [];
		for await (const page of queryPages) for (const election of page) elections.push(election);
		return {
			elections,
			lastEvaluatedKey: queryPages.lastEvaluatedKey ? queryPages.lastEvaluatedKey : undefined
		};
	}

	public async create(election: Partial<Election>): Promise<Election> {
		const electionId: string = uuid();
		const date: string = new Date().toISOString();

		election.electionId = electionId;
		election.electionStarted = false;
		election.electionFinished = false;

		return this.db.put(Object.assign(new ElectionItem(), {
			pk: `election#${election.electionId}`,
			sk: `election#${election.electionId}`,
			entity: 'election',
			times: {
				createdAt: date
			},
			...election
		}));
	}

	public async update(election: Partial<Election>): Promise<Election> {
		delete election.sk2;
		delete election.sk3;

		return this.db.update(Object.assign(new ElectionItem(), {
			pk: `election#${election.electionId}`,
			sk: `election#${election.electionId}`,
			...election
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(electionId: string): Promise<Election | undefined> {
		return this.db.delete(Object.assign(new ElectionItem(), {
			pk: `election#${electionId}`,
			sk: `election#${electionId}`
		}), {
			returnValues: 'ALL_OLD'
		});
	}

}

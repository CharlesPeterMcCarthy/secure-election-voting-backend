import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { QueryKey, ICandidateRepository} from '../interfaces';
import { Candidate, LastEvaluatedKey } from '../../types';
import { Repository } from './Repository';
import { CandidateItem } from '../../models/core/Candidate';
import { v4 as uuid } from 'uuid';

export class CandidateRepository extends Repository implements ICandidateRepository {

	public async getAll(lastEvaluatedKey?: LastEvaluatedKey): Promise<{ candidates: Candidate[]; lastEvaluatedKey: LastEvaluatedKey }> {
		const keyCondition: QueryKey = {
			entity: 'candidate'
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10
		};

		const queryPages: QueryPaginator<CandidateItem> = this.db.query(CandidateItem, keyCondition, queryOptions).pages();
		const candidates: Candidate[] = [];
		for await (const page of queryPages) for (const candidate of page) candidates.push(candidate);
		return {
			candidates,
			lastEvaluatedKey: queryPages.lastEvaluatedKey ? queryPages.lastEvaluatedKey : undefined
		};
	}

	public async getAllByElection(electionId: string, lastEvaluatedKey?: LastEvaluatedKey):
		Promise<{ candidates: Candidate[]; lastEvaluatedKey: LastEvaluatedKey }> {
		const keyCondition: QueryKey = {
			entity: 'candidate',
			sk: `election#${electionId}`
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10
		};

		const queryPages: QueryPaginator<CandidateItem> = this.db.query(CandidateItem, keyCondition, queryOptions).pages();
		const candidates: Candidate[] = [];
		for await (const page of queryPages) for (const candidate of page) candidates.push(candidate);
		return {
			candidates,
			lastEvaluatedKey: queryPages.lastEvaluatedKey ? queryPages.lastEvaluatedKey : undefined
		};
	}

	public async get(candidateId: string, electionId: string): Promise<Candidate> {
		return this.db.get(Object.assign(new CandidateItem(), {
			pk: `candidate#${candidateId}`,
			sk: `election#${electionId}`
		}));
	}

	public async create(candidate: Partial<Candidate>): Promise<Candidate> {
		const candidateId: string = uuid();
		const date: string = new Date().toISOString();

		candidate.candidateId = candidateId;

		return this.db.put(Object.assign(new CandidateItem(), {
			pk: `candidate#${candidateId}`,
			sk: `election#${candidate.electionId}`,
			entity: 'candidate',
			times: {
				createdAt: date
			},
			...candidate
		}));
	}

	public async update(candidate: Partial<Candidate>): Promise<Candidate> {
		delete candidate.sk2;
		delete candidate.sk3;

		return this.db.update(Object.assign(new CandidateItem(), {
			pk: `candidate#${candidate.candidateId}`,
			sk: `election#${candidate.electionId}`,
			...candidate
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(candidateId: string, electionId: string): Promise<Candidate | undefined> {
		return this.db.delete(Object.assign(new CandidateItem(), {
			pk: `candidate#${candidateId}`,
			sk: `election#${electionId}`
		}), {
			returnValues: 'ALL_OLD'
		});
	}

}

import { UserItem } from '../../models/core';
import { QueryIterator, QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { Repository } from './Repository';
import { IUserRepository, QueryKey } from '../interfaces';
import { LastEvaluatedKey, User, UserType } from '../../types';
import { v4 as uuid } from 'uuid';

export class UserRepository extends Repository implements IUserRepository {

	public async getAllByUserType(userType: UserType, lastEvaluatedKey?: LastEvaluatedKey):
		Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }> {
		const keyCondition: QueryKey = {
			entity: 'user',
			sk2: `userType#${userType}`
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10
		};

		const queryPages: QueryPaginator<UserItem> = this.db.query(UserItem, keyCondition, queryOptions).pages();
		const users: User[] = [];
		for await (const page of queryPages) for (const user of page) users.push(user);

		return {
			users,
			lastEvaluatedKey: queryPages.lastEvaluatedKey ? queryPages.lastEvaluatedKey : undefined
		};
	}

	public async getById(userId: string): Promise<User> {
		return this.db.get(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`
		}));
	}

	public async getByEmail(email: string): Promise<User> {
		const keyCondition: QueryKey = {
			entity: 'user',
			sk3: `email#${email}`
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk3-index'
		};

		const queryIterator: QueryIterator<UserItem> = this.db.query(UserItem, keyCondition, queryOptions);
		const users: User[] = [];

		for await (const user of queryIterator) users.push(user);

		return users[0];
	}

	public async create(toCreate: Partial<User>): Promise<User> {
		const userId: string = uuid();
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`,
			sk2: `userType#${toCreate.userType}`,
			sk3: `email#${toCreate.email}`,
			entity: 'user',
			userId,
			confirmed: true,
			times: {
				createdAt: date
			},
			...toCreate
		}));
	}

	public async update(changes: Partial<User>): Promise<User> {
		delete changes.sk2;
		delete changes.sk3;

		return this.db.update(Object.assign(new UserItem(), {
			pk: `user#${changes.userId}`,
			sk: `user#${changes.userId}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(userId: string): Promise<User | undefined> {
		return this.db.delete(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`
		}), {
			returnValues: 'ALL_OLD'
		});
	}
}

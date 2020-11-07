import { LastEvaluatedKey, User, UserItem, UserType } from '../..';

export interface IUserRepository {
	getAllByUserType(userType: UserType, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }>;
	getById(userId: string): Promise<User>;
	getByEmail(email: string): Promise<User>;
	create(toCreate: Partial<User>): Promise<User>;
	update(changes: Partial<User>): Promise<User>;
	delete(userId: string): Promise<User | undefined>;
}

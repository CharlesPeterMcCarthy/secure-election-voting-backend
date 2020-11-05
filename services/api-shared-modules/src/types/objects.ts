export type UserType = 'Voter' | 'Admin';

export interface DBItem {
	pk: string;
	sk: string;
	sk2?: string;
	sk3?: string;
	entity: string;
}

export interface User extends DBItem {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	userType: UserType;
	confirmed: boolean;
	times: {
		confirmedAt?: string;
		createdAt: Date | string;
		lastLogin?: Date | string;
	}
}

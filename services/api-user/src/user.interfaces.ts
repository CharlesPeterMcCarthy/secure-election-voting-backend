import { User, UserType } from '../../api-shared-modules/src/types';

export interface CreateVoterRequest {
	firstName: string;
	lastName: string;
	email: string;
	salt: string;
	hashedPassword: string;
	userType: UserType;
}

export interface UpdateVoterRequest extends User { }

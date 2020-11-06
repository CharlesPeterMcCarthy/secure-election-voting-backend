import { User, UserType } from '../../api-shared-modules/src/types';

export interface CreateVoterRequest {
	firstName: string;
	lastName: string;
	email: string;
	userType: UserType;
}

export interface UpdateVoterRequest extends User { }

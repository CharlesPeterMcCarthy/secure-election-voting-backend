import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	Election, BallotPaper, Candidate
} from '../../api-shared-modules/src';
import { ElectionItem } from '../../api-shared-modules/src/models/core/Election';
import {CreateBallotPaperRequest, SubmitBallotPaperRequest} from './ballot-paper.interfaces';

export class BallotPaperController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getBallotPaperById: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.ballotPaperId || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const ballotPaperId: string = event.pathParameters.ballotPaperId;
		const userId: string = event.pathParameters.userId;

		try {
			const ballotPaper: BallotPaper = await this.unitOfWork.BallotPapers.get(ballotPaperId, userId);

			return ResponseBuilder.ok({ ballotPaper });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Ballot Paper not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllBallotPapersByElection: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters - Election ID is missing');

		const electionId: string = event.pathParameters.electionId;

		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { ballotPapers: BallotPaper[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.BallotPapers.getAllByElection(electionId);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Ballot Papers');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getBallotPaperByElectionVoter: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId || !event.pathParameters.userId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const electionId: string = event.pathParameters.electionId;
		const userId: string = event.pathParameters.userId;

		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const ballotPaper: BallotPaper = await this.unitOfWork.BallotPapers.getByElectionVoter(userId, electionId);
			if (!ballotPaper) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Ballot Paper');

			return ResponseBuilder.ok({ ballotPaper });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllBallotPapersByCandidate: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.electionId || !event.pathParameters.candidateId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const electionId: string = event.pathParameters.electionId;
		const candidateId: string = event.pathParameters.candidateId;

		// let lastEvaluatedKey: LastEvaluatedKey;
		// if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: { ballotPapers: BallotPaper[]; lastEvaluatedKey: Partial<ElectionItem> } =
				await this.unitOfWork.BallotPapers.getAllByElectionCandidate(electionId, candidateId);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Ballot Papers');

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public submitBallotPaper: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: SubmitBallotPaperRequest = JSON.parse(event.body);

		if (!data.ballotPaper) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Ballot Paper is missing');
		if (!data.candidate) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Selected Candidate is missing');
		if (!data.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Selected Candidate is missing');

		const { ballotPaper, candidate, userId }: SubmitBallotPaperRequest = data;

		try {
			const bp: BallotPaper = await this.unitOfWork.BallotPapers.get(ballotPaper.ballotPaperId, userId);
			const c: Candidate = await this.unitOfWork.Candidates.get(candidate.candidateId, ballotPaper.electionId);

			bp.times.submittedVoteAt = new Date().toISOString();
			bp.voted = true;
			bp.voteCandidateId = c.candidateId;
			bp.vote = {
				candidateId: c.candidateId,
				electionId: c.electionId,
				firstName: c.firstName,
				lastName: c.lastName,
				party: c.party
			};

			const updatedBallotPaper: BallotPaper = await this.unitOfWork.BallotPapers.update(bp);

			return ResponseBuilder.ok({ ballotPaper: updatedBallotPaper });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Election not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createBallotPaper: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: CreateBallotPaperRequest = JSON.parse(event.body);

		if (!data.electionId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Election ID is missing');
		if (!data.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'User ID is missing');

		try {
			const ballotPaper: BallotPaper = await this.createBallot(data.userId, data.electionId);

			return ResponseBuilder.ok({ ballotPaper });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Election not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createBallot = async (userId: string, electionId: string): Promise<BallotPaper> => {
		const election: Election = await this.unitOfWork.Elections.get(electionId);

		const partialBallotPaper: Partial<BallotPaper> = {
			userId,
			electionId,
			electionName: election.electionName,
			candidates: election.candidates
		};

		return this.unitOfWork.BallotPapers.create(partialBallotPaper);
	}

}

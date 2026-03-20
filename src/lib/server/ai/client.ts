import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '$env/dynamic/private';

let _client: GoogleGenerativeAI | null = null;

export function getClient(): GoogleGenerativeAI {
	if (!_client) {
		const apiKey = env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY environment variable is not set');
		}
		_client = new GoogleGenerativeAI(apiKey);
	}
	return _client;
}

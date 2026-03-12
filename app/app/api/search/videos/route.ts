import axios from 'axios';

const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY;

if (!TWELVE_LABS_API_KEY) {
    throw new Error('Twelve Labs API key is missing.');
}

const TWELVE_LABS_API_URL = 'https://api.twelvelabs.io/v1/search';

export async function POST(request: Request) {
    const { query, case_id } = await request.json(); // Assuming case_id is passed for context, though not directly used in this simple search.

    if (!query) {
        return new Response(JSON.stringify({ message: 'Search query is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const response = await axios.post(TWELVE_LABS_API_URL, {
            query: query,
            limit: 10, // Adjust limit as needed
            // You might want to filter by a specific Twelve Labs index ID related to the case.
            // For now, it searches across all indexed content.
        }, {
            headers: {
                'x-api-key': TWELVE_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        // The response structure from Twelve Labs might vary. Adapt as necessary.
        // Typically, it would include search results with timestamps or similar identifiers.
        const searchResults = response.data.results.map((result: any) => ({
            // Example fields, adjust based on actual Twelve Labs response structure
            timestamp: result.start_time, // or similar field indicating time in video
            // Add other relevant info like snippet, confidence score, etc.
            snippet: result.snippet || `Found at ${result.start_time}`,
            videoId: result.video_id || 'N/A',
        }));

        return new Response(JSON.stringify(searchResults), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error searching videos with Twelve Labs:', error);
        let errorMessage = 'Error searching videos';
        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || error.message;
        }
        return new Response(JSON.stringify({ message: errorMessage }), {
            status: error.response?.status || 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

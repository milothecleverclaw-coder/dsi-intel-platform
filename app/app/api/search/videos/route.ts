const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY!;
const TWELVE_LABS_BASE_URL = 'https://api.twelvelabs.io/v1.3';

export async function POST(request: Request) {
    try {
        const { query, indexId } = await request.json();

        if (!query || !indexId) {
            return new Response(JSON.stringify({ message: 'query and indexId required' }), { status: 400 });
        }

        const response = await fetch(`${TWELVE_LABS_BASE_URL}/search`, {
            method: 'POST',
            headers: {
                'x-api-key': TWELVE_LABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                index_id: indexId,
                search_options: ['visual', 'conversation', 'text_in_video', 'logo'],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ message: 'Search failed', error: errorData }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error: any) {
        console.error('Video search error:', error);
        return new Response(JSON.stringify({ message: error.message || 'Video search failed' }), { status: 500 });
    }
}

const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY!;
const TWELVE_LABS_BASE_URL = 'https://api.twelvelabs.io/v1.3';

export async function POST(request: Request) {
    try {
        const { query, indexId } = await request.json();

        if (!query || !indexId) {
            return new Response(JSON.stringify({ message: 'query and indexId required' }), { status: 400 });
        }

        // Twelve Labs API requires multipart/form-data for search
        const formData = new FormData();
        formData.append('query_text', query);
        formData.append('index_id', indexId);
        formData.append('search_options', JSON.stringify(['visual', 'conversation', 'text_in_video', 'logo']));

        const response = await fetch(`${TWELVE_LABS_BASE_URL}/search`, {
            method: 'POST',
            headers: {
                'x-api-key': TWELVE_LABS_API_KEY,
            },
            body: formData,
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

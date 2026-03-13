const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY!;
const TWELVE_LABS_BASE_URL = 'https://api.twelvelabs.io/v1.3';

// Create a video indexing task
export async function POST(request: Request) {
    try {
        const { videoUrl, caseId, evidenceId, indexId } = await request.json();

        if (!videoUrl || !indexId) {
            return new Response(JSON.stringify({ message: 'videoUrl and indexId required' }), { status: 400 });
        }

        // Create indexing task in Twelve Labs
        const response = await fetch(`${TWELVE_LABS_BASE_URL}/videos`, {
            method: 'POST',
            headers: {
                'x-api-key': TWELVE_LABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                index_id: indexId,
                url: videoUrl,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ 
                message: 'Failed to start video indexing', 
                error: errorData 
            }), { status: response.status });
        }

        const data = await response.json();
        
        return new Response(JSON.stringify({
            taskId: data._id,
            videoId: data.video_id,
            status: 'pending',
            message: 'Video indexing started'
        }), { status: 200 });
    } catch (error: any) {
        console.error('Video indexing error:', error);
        return new Response(JSON.stringify({ message: error.message || 'Video indexing failed' }), { status: 500 });
    }
}

// Get indexing status
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');
        const indexId = searchParams.get('indexId');

        if (!taskId) {
            return new Response(JSON.stringify({ message: 'taskId required' }), { status: 400 });
        }

        // Get task status from Twelve Labs
        const response = await fetch(`${TWELVE_LABS_BASE_URL}/tasks/${taskId}`, {
            method: 'GET',
            headers: {
                'x-api-key': TWELVE_LABS_API_KEY,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ 
                message: 'Failed to get indexing status', 
                error: errorData 
            }), { status: response.status });
        }

        const data = await response.json();
        
        return new Response(JSON.stringify({
            taskId: data._id,
            status: data.status,
            videoId: data.video_id,
            progress: data.progress || 0,
        }), { status: 200 });
    } catch (error: any) {
        console.error('Video indexing status error:', error);
        return new Response(JSON.stringify({ message: error.message || 'Failed to get status' }), { status: 500 });
    }
}

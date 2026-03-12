const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY;
const TWELVE_LABS_BASE_URL = 'https://api.twelvelabs.io/v1.3';

if (!TWELVE_LABS_API_KEY) {
  console.warn('TWELVE_LABS_API_KEY is not set');
}

interface CreateEntityRequest {
  collectionId: string;
  name: string;
  photos: string[]; // Array of image URLs
}

export async function POST(request: Request) {
  if (!TWELVE_LABS_API_KEY) {
    return new Response(JSON.stringify({ message: 'Twelve Labs API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { collectionId, name, photos } = body as CreateEntityRequest;

    if (!collectionId || !name || !photos || photos.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'collectionId, name, and photos are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create entity in Twelve Labs
    const response = await fetch(`${TWELVE_LABS_BASE_URL}/entity-collections/${collectionId}/entities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TWELVE_LABS_API_KEY,
      },
      body: JSON.stringify({
        name,
        images: photos,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Twelve Labs API error:', errorData);
      return new Response(JSON.stringify({ 
        message: 'Failed to create entity in Twelve Labs',
        error: errorData 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      entityId: data.id,
      name: data.name,
      collectionId: data.collection_id,
      createdAt: data.created_at,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating Twelve Labs entity:', error);
    return new Response(JSON.stringify({ 
      message: 'Error creating entity',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Get entity status
export async function GET(request: Request) {
  if (!TWELVE_LABS_API_KEY) {
    return new Response(JSON.stringify({ message: 'Twelve Labs API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('collectionId');
  const entityId = searchParams.get('entityId');

  if (!collectionId || !entityId) {
    return new Response(JSON.stringify({ message: 'collectionId and entityId are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(
      `${TWELVE_LABS_BASE_URL}/entity-collections/${collectionId}/entities/${entityId}`,
      {
        headers: {
          'x-api-key': TWELVE_LABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ message: 'Failed to fetch entity' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching Twelve Labs entity:', error);
    return new Response(JSON.stringify({ message: 'Error fetching entity' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

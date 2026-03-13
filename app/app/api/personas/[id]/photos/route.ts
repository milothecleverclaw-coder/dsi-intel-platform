import pool from '@/lib/db';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER!;
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Helper to generate SAS URL for a blob
async function generateSASUrl(blobName: string): Promise<string> {
  const connectionStringParts = AZURE_STORAGE_CONNECTION_STRING.split(';');
  let accountName = '';
  let accountKey = '';

  for (const part of connectionStringParts) {
    if (part.startsWith('AccountName=')) {
      accountName = part.replace('AccountName=', '');
    }
    if (part.startsWith('AccountKey=')) {
      accountKey = part.replace('AccountKey=', '');
    }
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  const sasOptions = {
    containerName: AZURE_STORAGE_CONTAINER,
    blobName: blobName,
    permissions: BlobSASPermissions.parse('r'),
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // 1 hour
  };

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  // URL-encode the blob name for the URL (but signature was calculated with decoded name)
  const encodedBlobName = blobName.split('/').map(part => encodeURIComponent(part)).join('/');
  return `https://${accountName}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${encodedBlobName}?${sasToken}`;
}

// Extract blob name from full Azure blob URL
function extractBlobName(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    // URL path is like /container/blobName, remove leading /container/
    // Decode URL-encoded characters (e.g., %20 -> space) for SAS signature
    return decodeURIComponent(url.pathname.replace(`/${AZURE_STORAGE_CONTAINER}/`, ''));
  } catch {
    // Fallback: split by / and reconstruct from index 4 onward
    return decodeURIComponent(imageUrl.split('/').slice(4).join('/'));
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM persona_photos WHERE persona_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Generate fresh SAS URLs for each photo
    const photosWithSAS = await Promise.all(
      rows.map(async (row: { image_url: string }) => {
        const blobName = extractBlobName(row.image_url);
        const sasUrl = await generateSASUrl(blobName);
        return { ...row, image_url: sasUrl };
      })
    );

    return new Response(JSON.stringify(photosWithSAS), { status: 200 });
  } catch (error) {
    console.error('Error fetching persona photos:', error);
    return new Response(JSON.stringify({ message: 'Error fetching photos' }), { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Check how many photos already exist
    const { rows: existingPhotos } = await pool.query(
      'SELECT COUNT(*) as count FROM persona_photos WHERE persona_id = $1',
      [id]
    );

    if (parseInt(existingPhotos[0].count) >= 5) {
      return new Response(JSON.stringify({ message: 'Maximum 5 photos allowed per persona' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ message: 'file is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ message: 'Only image files are allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upload to Azure Blob
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blobName = `personas/${id}/photos/${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: file.type } });

    // Store raw blob URL (SAS token generated on GET)
    const imageUrl = blockBlobClient.url;

    // Save to database
    const { rows } = await pool.query(
      'INSERT INTO persona_photos (persona_id, image_url) VALUES ($1, $2) RETURNING *',
      [id, imageUrl]
    );

    // Return with fresh SAS URL for immediate display
    const sasUrl = await generateSASUrl(blobName);
    const responseWithSAS = { ...rows[0], image_url: sasUrl };

    return new Response(JSON.stringify(responseWithSAS), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error uploading persona photo:', error);
    return new Response(JSON.stringify({ message: 'Error uploading photo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { entityId } = await request.json();

    if (!entityId) {
      return new Response(JSON.stringify({ message: 'entityId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update all photos for this persona with the entity ID
    await pool.query(
      'UPDATE persona_photos SET twelve_labs_entity_id = $1 WHERE persona_id = $2',
      [entityId, id]
    );

    // Also update the persona record with collection info
    await pool.query(
      'UPDATE personas SET twelve_labs_collection_id = $1 WHERE persona_id = $2',
      [process.env.TWELVE_LABS_COLLECTION_ID || 'default', id]
    );

    return new Response(JSON.stringify({ message: 'Entity ID updated' }), { status: 200 });
  } catch (error) {
    console.error('Error updating entity ID:', error);
    return new Response(JSON.stringify({ message: 'Error updating entity ID' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get('photoId');

  if (!photoId) {
    return new Response(JSON.stringify({ message: 'photoId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get photo info
    const { rows } = await pool.query(
      'SELECT * FROM persona_photos WHERE photo_id = $1 AND persona_id = $2',
      [photoId, id]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Photo not found' }), { status: 404 });
    }

    const photo = rows[0];

    // Delete from Azure Blob (optional - extract blob name from URL)
    try {
      const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
      // Extract blob name from URL
      const url = new URL(photo.image_url);
      const blobName = url.pathname.replace(`/${AZURE_STORAGE_CONTAINER}/`, '');
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    } catch (blobError) {
      console.warn('Could not delete blob:', blobError);
    }

    // Delete from database
    await pool.query('DELETE FROM persona_photos WHERE photo_id = $1', [photoId]);

    return new Response(JSON.stringify({ message: 'Photo deleted' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting persona photo:', error);
    return new Response(JSON.stringify({ message: 'Error deleting photo' }), { status: 500 });
  }
}

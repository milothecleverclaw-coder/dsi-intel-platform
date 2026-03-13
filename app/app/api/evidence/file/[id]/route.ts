import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evidenceId } = await params;
    
    // Get evidence record from database
    const { rows } = await pool.query('SELECT * FROM evidence WHERE evidence_id = $1', [evidenceId]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Evidence not found' }, { status: 404 });
    }
    
    const evidence = rows[0];
    const blobPath = evidence.blob_path;
    
    // Create blob service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Extract account name and key from connection string
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
    
    // Generate SAS token valid for 1 hour
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const sasOptions = {
      containerName: AZURE_STORAGE_CONTAINER,
      blobName: blobPath,
      permissions: BlobSASPermissions.parse('r'), // Read only
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000), // 1 hour
    };
    
    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    
    // Construct the full URL with SAS token
    const sasUrl = `https://${accountName}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${blobPath}?${sasToken}`;
    
    return NextResponse.json({ 
      url: sasUrl,
      filename: evidence.filename,
      fileType: evidence.file_type,
      mimeType: evidence.mime_type || 'application/octet-stream'
    });
    
  } catch (error) {
    console.error('Error generating SAS URL:', error);
    return NextResponse.json(
      { message: 'Failed to generate file URL' },
      { status: 500 }
    );
  }
}

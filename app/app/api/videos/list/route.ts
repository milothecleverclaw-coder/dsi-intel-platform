import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY!;
const TWELVE_LABS_BASE_URL = 'https://api.twelvelabs.io/v1.3';

// List all videos in a case with Twelve Labs indexing status
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const caseId = searchParams.get('caseId');

        if (!caseId) {
            return new Response(JSON.stringify({ message: 'caseId required' }), { status: 400 });
        }

        // Get case's Twelve Labs index_id
        const caseResult = await pool.query('SELECT twelve_labs_index_id FROM cases WHERE case_id = $1', [caseId]);
        const caseIndexId = caseResult.rows[0]?.twelve_labs_index_id || null;

        // Get all video evidence from the database
        const { rows } = await pool.query(
            'SELECT * FROM evidence WHERE case_id = $1 AND file_type = $2 ORDER BY uploaded_at DESC',
            [caseId, 'video']
        );

        // If we have an indexId, also fetch video status from Twelve Labs
        let indexedVideos: any[] = [];
        if (caseIndexId && TWELVE_LABS_API_KEY) {
            try {
                const response = await fetch(`${TWELVE_LABS_BASE_URL}/indexes/${caseIndexId}/videos`, {
                    method: 'GET',
                    headers: {
                        'x-api-key': TWELVE_LABS_API_KEY,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    indexedVideos = data.data || [];
                }
            } catch (e) {
                console.error('Failed to fetch indexed videos:', e);
            }
        }

        // Merge database videos with indexing status
        const videos = rows.map((evidence: any) => {
            const indexed = indexedVideos.find((v: any) => 
                v.metadata?.filename === evidence.filename || 
                v._id === evidence.twelve_labs_video_id
            );
            
            return {
                evidence_id: evidence.evidence_id,
                filename: evidence.filename,
                display_name: evidence.display_name,
                blob_path: evidence.blob_path,
                uploaded_at: evidence.uploaded_at,
                twelve_labs_video_id: evidence.twelve_labs_video_id || indexed?._id,
                indexing_status: indexed?.system_metadata?.status || (evidence.twelve_labs_video_id ? 'ready' : 'not_indexed'),
            };
        });

        return NextResponse.json({ videos, indexId: caseIndexId }, { status: 200 });
    } catch (error: any) {
        console.error('Error listing videos:', error);
        return new Response(JSON.stringify({ message: error.message || 'Failed to list videos' }), { status: 500 });
    }
}

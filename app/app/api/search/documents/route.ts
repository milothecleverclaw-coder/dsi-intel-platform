import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { caseId, query } = await request.json();

        if (!caseId || !query) {
            return new Response(JSON.stringify({ 
                message: 'caseId and query are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Search through evidence documents' extracted text
        // Assuming there's an evidence table with extracted_text column
        // If not, we'll return empty results for now
        try {
            const { rows } = await pool.query(
                `SELECT 
                    e.evidence_id,
                    e.filename,
                    e.display_name,
                    e.file_type,
                    e.blob_path,
                    CASE 
                        WHEN e.extracted_text ILIKE $1 THEN e.extracted_text
                        ELSE NULL
                    END as matching_text
                FROM evidence e
                WHERE e.case_id = $2 
                AND e.extracted_text IS NOT NULL
                AND e.extracted_text ILIKE $1`,
                [`%${query}%`, caseId]
            );

            // Format results
            const results = rows.map(row => ({
                evidence_id: row.evidence_id,
                filename: row.filename,
                display_name: row.display_name,
                file_type: row.file_type,
                text: row.matching_text ? extractSnippet(row.matching_text, query) : null,
            })).filter(r => r.text);

            return new Response(JSON.stringify({ 
                results,
                count: results.length 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (dbError: any) {
            // If the extracted_text column doesn't exist, return empty results
            if (dbError.code === '42703') { // column does not exist
                return new Response(JSON.stringify({ 
                    results: [],
                    count: 0,
                    message: 'Document search not yet available - evidence text extraction pending'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw dbError;
        }
    } catch (error: any) {
        console.error('Error searching documents:', error);
        return new Response(JSON.stringify({ 
            message: error.message || 'Error searching documents' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Helper to extract a snippet around the search term
function extractSnippet(text: string, query: string, contextLength = 100): string {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + query.length + contextLength);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
}

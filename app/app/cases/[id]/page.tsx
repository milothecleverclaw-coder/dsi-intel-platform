import Link from 'next/link';

// Dummy data for now, will be replaced by actual data fetching
interface CaseDetails {
  case_id: string;
  case_number: string;
  title: string;
  narrative_report: string;
  status: string;
  created_at: string;
  updated_at: string;
}

async function getCaseDetails(id: string): Promise<CaseDetails> {
  // Replace with actual API call to fetch case details
  // const res = await fetch(`http://localhost:3000/api/cases/${id}`);
  // if (!res.ok) {
  //   throw new Error('Failed to fetch case details');
  // }
  // return res.json();

  // Dummy data for now
  return {
    case_id: id,
    case_number: `DSI-2023-${id.slice(-3)}`,
    title: `Case Title for ${id}`,
    narrative_report: `This is the narrative report for case ${id}. It contains all the details about the investigation.`,
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default async function CaseDashboardPage({ params }: { params: { id: string } }) {
  const caseId = params.id;
  // const caseDetails = await getCaseDetails(caseId);
  const caseDetails: CaseDetails = await getCaseDetails(caseId); // Using dummy data for now

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Case Dashboard: {caseDetails.title} ({caseDetails.case_number})</h1>
      <div className="mb-6">
        <p><strong>Status:</strong> {caseDetails.status}</p>
        <p><strong>Created At:</strong> {new Date(caseDetails.created_at).toLocaleString()}</p>
        <p><strong>Last Updated:</strong> {new Date(caseDetails.updated_at).toLocaleString()}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Narrative Report</h2>
        <p>{caseDetails.narrative_report}</p>
        {/* TODO: Add an edit button/modal for narrative_report */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href={`/cases/${caseId}/evidence`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition duration-300">
          Evidence
        </Link>
        <Link href={`/cases/${caseId}/personas`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition duration-300">
          Personas
        </Link>
        <Link href={`/cases/${caseId}/search`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition duration-300">
          Search
        </Link>
        <Link href={`/cases/${caseId}/pins`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition duration-300">
          Pins
        </Link>
        <Link href={`/cases/${caseId}/timeline`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition duration-300">
          Timeline
        </Link>
        <Link href={`/cases/${caseId}/chat`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition duration-300">
          Chat
        </Link>
      </div>
    </div>
  );
}

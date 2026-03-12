import Link from 'next/link';

interface Case {
  case_id: string;
  case_number: string;
  title: string;
  status: string;
}

async function getCases(): Promise<Case[]> {
  const res = await fetch('http://localhost:3000/api/cases'); // Assuming the app runs on port 3000
  if (!res.ok) {
    throw new Error('Failed to fetch cases');
  }
  return res.json();
}

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <Link href="/cases/new"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        New Case
      </Link>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cases.map((caseItem) => (
            <tr key={caseItem.case_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{caseItem.case_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseItem.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseItem.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link href={`/cases/${caseItem.case_id}`}
                      className="text-indigo-600 hover:text-indigo-900">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

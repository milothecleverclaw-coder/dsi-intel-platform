'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Case {
  case_id: string;
  case_number: string;
  title: string;
  status: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <Link href="/cases/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        New Case
      </Link>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cases.map((c) => (
            <tr key={c.case_id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.case_number}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{c.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{c.status}</td>
              <td className="px-6 py-4 text-sm font-medium">
                <Link href={`/cases/${c.case_id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

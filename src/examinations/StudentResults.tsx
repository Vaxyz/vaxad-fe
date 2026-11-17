import { useMemo } from 'react';
import { useStudentPublishedResultsQuery } from '../app/api';
import { useAppSelector } from '../app/hooks';
import './student-results.css';

export default function StudentResults() {
  const user = useAppSelector(state => state.auth.user);
  const { data, isLoading, isError } = useStudentPublishedResultsQuery(user?.id ?? '', { skip: !user?.id });
  const results = data?.data ?? [];
  const grouped = useMemo(() => {
    return results.reduce<Record<string, typeof results>>((acc, result) => {
      const key = result.assessmentConfigurationId;
      (acc[key] ??= []).push(result);
      return acc;
    }, {});
  }, [results]);

  return <main className="page student-results-page">
    <header className="student-results-hero">
      <div><p className="eyebrow">ACADEMIC RESULTS</p><h1>My Published Results</h1><p className="muted">Official results published by your school.</p></div>
      <div className="results-count"><span>Published records</span><strong>{results.length}</strong></div>
    </header>
    {isLoading && <section className="panel empty-state">Loading published results…</section>}
    {isError && <section className="panel error-text">Unable to load your published results. Please try again.</section>}
    {!isLoading && !isError && results.length === 0 && <section className="panel empty-state">No published results are available yet.</section>}
    {!isLoading && !isError && Object.entries(grouped).map(([configurationId, items]) => (
      <section className="panel result-card" key={configurationId}>
        <div className="section-title"><div><h2>{items[0].studentName}</h2><p className="muted">Admission No. {items[0].admissionNumber}</p></div><span className="published-badge">PUBLISHED</span></div>
        <div className="student-result-table-wrap"><table><thead><tr><th>Result</th><th>Total</th><th>Grade</th><th>Remark</th><th>Published</th></tr></thead><tbody>{items.map(result => <tr key={result.id}><td>{result.assessmentConfigurationId}</td><td>{result.totalScore.toFixed(2)}</td><td><strong className="grade-pill">{result.grade}</strong></td><td>{result.remark}</td><td>{new Date(result.publishedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
      </section>
    ))}
  </main>;
}

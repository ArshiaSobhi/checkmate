export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 text-white">
      <h1 className="text-3xl font-semibold">FAQ</h1>
      <ul className="mt-6 space-y-4 text-slate-200">
        <li>
          <strong>How do I play ranked?</strong> Verify your email then choose Ranked in Play.
        </li>
        <li>
          <strong>Can I invite friends?</strong> Yes, add them in Friends then start a casual invite.
        </li>
        <li>
          <strong>How does scoring work?</strong> Wins grant +5 points, losses -5, promotions at 100.
        </li>
      </ul>
    </div>
  );
}

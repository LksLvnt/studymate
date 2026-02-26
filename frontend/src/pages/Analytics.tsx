import { BarChart3 } from "lucide-react";

export default function Analytics() {
  // TODO: fetch real data from /api/analytics
  // Example of how Recharts will be used:
  //
  // import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
  // const data = [{ date: "Mon", accuracy: 65 }, { date: "Tue", accuracy: 72 }, ...];
  //
  // <ResponsiveContainer width="100%" height={300}>
  //   <LineChart data={data}>
  //     <XAxis dataKey="date" />
  //     <YAxis />
  //     <Tooltip />
  //     <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} />
  //   </LineChart>
  // </ResponsiveContainer>

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Performance Analytics</h2>
      <div className="bg-surface-light rounded-xl border border-surface-lighter p-12 text-center">
        <BarChart3
          size={48}
          className="mx-auto mb-3 text-text-muted opacity-50"
        />
        <p className="text-text-muted">
          Complete some flashcards or quizzes to see your performance data.
        </p>
        <p className="text-sm text-text-muted mt-2">
          Accuracy over time · Topic breakdown · Confidence curves
        </p>
      </div>
    </div>
  );
}

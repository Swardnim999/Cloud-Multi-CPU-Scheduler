import { GanttEntry } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface GanttChartProps {
  ganttChart: GanttEntry[];
  cpuCount: number;
}

export function GanttChart({ ganttChart, cpuCount }: GanttChartProps) {
  const cpuGanttData = Array.from({ length: cpuCount }, (_, i) => ({
    cpu: i + 1,
    entries: ganttChart.filter(g => g.cpu === i + 1)
  }));

  return (
    <Card className="p-4 card-glow">
      <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
        <span className="text-secondary">{'>'}</span> CPU GANTT CHART
      </h3>
      <div className="space-y-3 font-mono text-xs">
        {cpuGanttData.map(({ cpu, entries }) => (
          <div key={cpu} className="flex items-start gap-2">
            <div className="text-accent font-bold min-w-[60px]">CPU {cpu}:</div>
            <div className="flex-1 flex flex-wrap gap-1">
              {entries.length === 0 ? (
                <div className="px-2 py-1 bg-muted/50 border border-border rounded text-muted-foreground">
                  | idle |
                </div>
              ) : (
                entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-1 bg-gradient-primary border border-primary/50 rounded text-primary-foreground font-bold transition-all hover:scale-105"
                  >
                    | P{entry.processId} ({entry.start}-{entry.end}) |
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

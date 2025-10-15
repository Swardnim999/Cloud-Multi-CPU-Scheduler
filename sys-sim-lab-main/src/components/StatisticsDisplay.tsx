import { Card } from '@/components/ui/card';

interface StatisticsDisplayProps {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
}

export function StatisticsDisplay({ avgWaitingTime, avgTurnaroundTime }: StatisticsDisplayProps) {
  return (
    <Card className="p-4 card-glow">
      <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
        <span className="text-secondary">{'>'}</span> STATISTICS
      </h3>
      <div className="space-y-2 font-mono text-sm">
        <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
          <span className="text-muted-foreground">Avg Waiting Time:</span>
          <span className="text-primary font-bold">{avgWaitingTime.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
          <span className="text-muted-foreground">Avg Turnaround Time:</span>
          <span className="text-accent font-bold">{avgTurnaroundTime.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}

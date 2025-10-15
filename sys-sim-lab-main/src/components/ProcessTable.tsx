import { Process } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface ProcessTableProps {
  processes: Process[];
}

export function ProcessTable({ processes }: ProcessTableProps) {
  return (
    <Card className="p-4 card-glow overflow-hidden">
      <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
        <span className="text-secondary">{'>'}</span> PROCESS TABLE
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-primary font-mono text-xs">PID</TableHead>
              <TableHead className="text-primary font-mono text-xs">Arr</TableHead>
              <TableHead className="text-primary font-mono text-xs">Burst</TableHead>
              <TableHead className="text-primary font-mono text-xs">Prio</TableHead>
              <TableHead className="text-primary font-mono text-xs">CPU</TableHead>
              <TableHead className="text-primary font-mono text-xs">Start</TableHead>
              <TableHead className="text-primary font-mono text-xs">Comp</TableHead>
              <TableHead className="text-primary font-mono text-xs">Wait</TableHead>
              <TableHead className="text-primary font-mono text-xs">TAT</TableHead>
              <TableHead className="text-primary font-mono text-xs">MemStart</TableHead>
              <TableHead className="text-primary font-mono text-xs">MemSize</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map((proc) => (
              <TableRow key={proc.pid} className="border-border hover:bg-muted/30">
                <TableCell className="font-mono text-xs text-secondary">{proc.pid}</TableCell>
                <TableCell className="font-mono text-xs">{proc.arrivalTime}</TableCell>
                <TableCell className="font-mono text-xs">{proc.burstTime}</TableCell>
                <TableCell className="font-mono text-xs">{proc.priority}</TableCell>
                <TableCell className="font-mono text-xs text-accent">
                  {proc.cpuAssigned > 0 ? proc.cpuAssigned : '-'}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {proc.startTime >= 0 ? proc.startTime : '-'}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {proc.completionTime >= 0 ? proc.completionTime : '-'}
                </TableCell>
                <TableCell className="font-mono text-xs text-primary">
                  {proc.waitingTime >= 0 ? proc.waitingTime : 0}
                </TableCell>
                <TableCell className="font-mono text-xs text-primary">
                  {proc.turnaroundTime >= 0 ? proc.turnaroundTime : 0}
                </TableCell>
                <TableCell className="font-mono text-xs text-secondary">
                  {proc.memoryStart >= 0 ? proc.memoryStart : '-'}
                </TableCell>
                <TableCell className="font-mono text-xs">{proc.memoryRequired}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

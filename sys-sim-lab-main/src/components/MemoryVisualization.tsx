import { MemoryLog } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface MemoryVisualizationProps {
  memoryLogs: MemoryLog[];
  totalMemory: number;
}

export function MemoryVisualization({ memoryLogs, totalMemory }: MemoryVisualizationProps) {
  // Group by time to show free blocks at different points
  const currentLogs = memoryLogs.filter(log => log.deallocatedAt === -1 || log.deallocatedAt > 0);
  
  // Calculate free blocks (simplified - showing final state)
  const usedRanges = memoryLogs.map(log => ({
    start: log.start,
    end: log.end,
    processId: log.processId,
    from: log.allocatedAt,
    to: log.deallocatedAt === -1 ? 'running' : log.deallocatedAt
  }));

  // Calculate free memory ranges
  const getFreeBlocks = () => {
    const used = usedRanges
      .filter(r => r.to === 'running')
      .sort((a, b) => a.start - b.start);
    
    const free: { start: number; end: number }[] = [];
    let current = 0;

    for (const range of used) {
      if (current < range.start) {
        free.push({ start: current, end: range.start });
      }
      current = Math.max(current, range.end);
    }

    if (current < totalMemory) {
      free.push({ start: current, end: totalMemory });
    }

    return free;
  };

  const freeBlocks = getFreeBlocks();

  return (
    <Card className="p-4 card-glow">
      <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
        <span className="text-secondary">{'>'}</span> MEMORY LOGS
      </h3>
      
      <div className="space-y-4 font-mono text-xs">
        {/* Free Blocks */}
        <div>
          <div className="text-muted-foreground mb-2">Free blocks (start - end):</div>
          <div className="space-y-1">
            {freeBlocks.length === 0 ? (
              <div className="text-destructive">No free blocks</div>
            ) : (
              freeBlocks.map((block, idx) => (
                <div key={idx} className="text-accent">
                  [{block.start} - {block.end}) size={block.end - block.start}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Memory Usage Log */}
        <div>
          <div className="text-muted-foreground mb-2">Memory usage log:</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {memoryLogs.map((log, idx) => (
              <div key={idx} className="text-foreground">
                <span className="text-primary">P{log.processId}</span>
                {' -> '}
                <span className="text-secondary">
                  [{log.start} - {log.end})
                </span>
                {' from '}
                <span className="text-accent">{log.allocatedAt}</span>
                {' to '}
                <span className="text-accent">
                  {log.deallocatedAt === -1 ? 'running' : log.deallocatedAt}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Memory Bar */}
        <div>
          <div className="text-muted-foreground mb-2">Memory visualization:</div>
          <div className="h-8 bg-muted rounded-sm overflow-hidden flex">
            {usedRanges
              .filter(r => r.to === 'running')
              .map((range, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold border-r border-primary-foreground/20"
                  style={{
                    width: `${((range.end - range.start) / totalMemory) * 100}%`,
                    marginLeft: `${(range.start / totalMemory) * 100}%`
                  }}
                  title={`P${range.processId}: ${range.start}-${range.end}`}
                >
                  P{range.processId}
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

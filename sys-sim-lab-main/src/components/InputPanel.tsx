import { useState } from 'react';
import { Process, SimulationConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface InputPanelProps {
  onSimulate: (config: SimulationConfig, processes: Process[]) => void;
}

export function InputPanel({ onSimulate }: InputPanelProps) {
  const [inputMode, setInputMode] = useState<'manual' | 'random'>('manual');
  const [numProcesses, setNumProcesses] = useState(3);
  const [numCPUs, setNumCPUs] = useState(1);
  const [memoryFit, setMemoryFit] = useState<1 | 2 | 3>(1);
  const [schedulingAlgo, setSchedulingAlgo] = useState<1 | 2 | 3 | 4>(1);
  const [isPreemptive, setIsPreemptive] = useState(false);
  const [quantum, setQuantum] = useState(2);
  const [processes, setProcesses] = useState<Partial<Process>[]>([
    { pid: 1, arrivalTime: 0, burstTime: 5, priority: 2, memoryRequired: 50 },
    { pid: 2, arrivalTime: 1, burstTime: 3, priority: 1, memoryRequired: 30 },
    { pid: 3, arrivalTime: 2, burstTime: 8, priority: 3, memoryRequired: 70 },
  ]);

  const handleNumProcessesChange = (value: number) => {
    const count = Math.min(50, Math.max(1, value));
    setNumProcesses(count);
    
    if (inputMode === 'random') {
      generateRandomProcesses(count);
    } else {
      const newProcesses = Array.from({ length: count }, (_, i) => ({
        pid: i + 1,
        arrivalTime: i,
        burstTime: 5,
        priority: 1,
        memoryRequired: 50,
      }));
      setProcesses(newProcesses);
    }
  };

  const generateRandomProcesses = (count: number) => {
    const randomProcs = Array.from({ length: count }, (_, i) => ({
      pid: i + 1,
      arrivalTime: Math.floor(Math.random() * 10),
      burstTime: Math.floor(Math.random() * 10) + 1,
      priority: Math.floor(Math.random() * 5) + 1,
      memoryRequired: Math.floor(Math.random() * 100) + 20,
    }));
    setProcesses(randomProcs);
  };

  const handleProcessChange = (index: number, field: keyof Process, value: number) => {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: value };
    setProcesses(updated);
  };

  const handleSimulate = () => {
    // Validate processes
    const validProcesses = processes.every(
      p => 
        p.arrivalTime !== undefined && 
        p.burstTime !== undefined && 
        p.priority !== undefined && 
        p.memoryRequired !== undefined &&
        p.burstTime > 0 &&
        p.memoryRequired > 0
    );

    if (!validProcesses) {
      toast.error('Please ensure all process fields are valid (burst time and memory > 0)');
      return;
    }

    const config: SimulationConfig = {
      numProcesses,
      numCPUs: Math.min(4, Math.max(1, numCPUs)),
      memoryFitAlgorithm: memoryFit,
      schedulingAlgorithm: schedulingAlgo,
      isPreemptive,
      quantum,
      totalMemory: 1024,
    };

    onSimulate(config, processes as Process[]);
    toast.success('Simulation started');
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-2">
      <div className="sticky top-0 bg-background pb-4 z-10">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <span className="text-secondary">{'>'}</span> SYSTEM CONFIG
        </h2>
      </div>

      {/* Input Mode */}
      <Card className="p-4 card-glow">
        <Label className="text-sm text-muted-foreground mb-2 block">Input Mode</Label>
        <div className="flex gap-2">
          <Button
            variant={inputMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setInputMode('manual')}
            className="flex-1"
          >
            Manual
          </Button>
          <Button
            variant={inputMode === 'random' ? 'default' : 'outline'}
            onClick={() => {
              setInputMode('random');
              generateRandomProcesses(numProcesses);
            }}
            className="flex-1"
          >
            Random
          </Button>
        </div>
      </Card>

      {/* Basic Config */}
      <Card className="p-4 card-glow space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">Number of Processes (1-50)</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={numProcesses}
            onChange={(e) => handleNumProcessesChange(parseInt(e.target.value) || 1)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Number of CPUs (1-4)</Label>
          <Input
            type="number"
            min={1}
            max={4}
            value={numCPUs}
            onChange={(e) => setNumCPUs(parseInt(e.target.value) || 1)}
            className="mt-1"
          />
        </div>
      </Card>

      {/* Algorithms */}
      <Card className="p-4 card-glow space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">Memory Fit Algorithm</Label>
          <Select value={memoryFit.toString()} onValueChange={(v) => setMemoryFit(parseInt(v) as 1 | 2 | 3)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">First Fit</SelectItem>
              <SelectItem value="2">Best Fit</SelectItem>
              <SelectItem value="3">Worst Fit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Scheduling Algorithm</Label>
          <Select value={schedulingAlgo.toString()} onValueChange={(v) => setSchedulingAlgo(parseInt(v) as 1 | 2 | 3 | 4)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">FCFS</SelectItem>
              <SelectItem value="2">SJF</SelectItem>
              <SelectItem value="3">Priority</SelectItem>
              <SelectItem value="4">Round Robin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">Preemptive</Label>
          <Switch checked={isPreemptive} onCheckedChange={setIsPreemptive} />
        </div>

        {schedulingAlgo === 4 && (
          <div>
            <Label className="text-sm text-muted-foreground">Time Quantum</Label>
            <Input
              type="number"
              min={1}
              value={quantum}
              onChange={(e) => setQuantum(parseInt(e.target.value) || 2)}
              className="mt-1"
            />
          </div>
        )}
      </Card>

      {/* Process Input */}
      {inputMode === 'manual' && (
        <Card className="p-4 card-glow">
          <Label className="text-sm text-muted-foreground mb-3 block">Process Details</Label>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {processes.map((proc, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded border border-border space-y-2">
                <div className="text-xs text-primary font-bold">P{proc.pid}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Arrival</Label>
                    <Input
                      type="number"
                      min={0}
                      value={proc.arrivalTime ?? 0}
                      onChange={(e) => handleProcessChange(idx, 'arrivalTime', parseInt(e.target.value) || 0)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Burst</Label>
                    <Input
                      type="number"
                      min={1}
                      value={proc.burstTime ?? 1}
                      onChange={(e) => handleProcessChange(idx, 'burstTime', parseInt(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Priority</Label>
                    <Input
                      type="number"
                      min={1}
                      value={proc.priority ?? 1}
                      onChange={(e) => handleProcessChange(idx, 'priority', parseInt(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Memory</Label>
                    <Input
                      type="number"
                      min={1}
                      value={proc.memoryRequired ?? 1}
                      onChange={(e) => handleProcessChange(idx, 'memoryRequired', parseInt(e.target.value) || 1)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Run Button */}
      <Button
        onClick={handleSimulate}
        className="w-full terminal-glow"
        size="lg"
      >
        <span className="text-secondary mr-2">{'>'}</span>
        RUN SIMULATION
      </Button>
    </div>
  );
}

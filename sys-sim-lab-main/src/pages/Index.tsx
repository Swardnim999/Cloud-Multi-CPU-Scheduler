import { useState } from 'react';
import { Process, SimulationConfig, SimulationResult } from '@/lib/types';
import { Scheduler } from '@/lib/scheduler';
import { InputPanel } from '@/components/InputPanel';
import { ProcessTable } from '@/components/ProcessTable';
import { GanttChart } from '@/components/GanttChart';
import { MemoryVisualization } from '@/components/MemoryVisualization';
import { StatisticsDisplay } from '@/components/StatisticsDisplay';
import { Cpu, Database } from 'lucide-react';

const Index = () => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = (config: SimulationConfig, processes: Process[]) => {
    setIsSimulating(true);
    
    // Simulate with a small delay for visual feedback
    setTimeout(() => {
      const scheduler = new Scheduler(config, processes);
      const simulationResult = scheduler.simulate();
      setResult(simulationResult);
      setIsSimulating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded terminal-glow">
              <Cpu className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Cloud Multi-CPU Scheduler
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Advanced OS Simulation Engine v1.0
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Inputs */}
          <div className="lg:col-span-1 h-full overflow-hidden">
            <InputPanel onSimulate={handleSimulate} />
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 h-full overflow-y-auto space-y-4">
            {isSimulating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="animate-pulse">
                    <Database className="w-16 h-16 text-primary mx-auto terminal-glow" />
                  </div>
                  <div className="text-primary font-mono">
                    <span className="text-secondary">{'>'}</span> Simulating...
                  </div>
                </div>
              </div>
            ) : result ? (
              <>
                <ProcessTable processes={result.processes} />
                <GanttChart ganttChart={result.ganttChart} cpuCount={result.cpuCount} />
                <MemoryVisualization 
                  memoryLogs={result.memoryLogs} 
                  totalMemory={1024} 
                />
                <StatisticsDisplay
                  avgWaitingTime={result.avgWaitingTime}
                  avgTurnaroundTime={result.avgTurnaroundTime}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <div className="text-6xl opacity-20">
                    <Cpu className="w-24 h-24 text-primary mx-auto" />
                  </div>
                  <div className="text-muted-foreground font-mono text-sm">
                    <span className="text-secondary">{'>'}</span> Configure parameters and run simulation
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

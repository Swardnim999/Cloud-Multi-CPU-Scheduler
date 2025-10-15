export interface Process {
  pid: number;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  memoryRequired: number;
  
  // Runtime fields
  remainingTime: number;
  startTime: number;
  completionTime: number;
  waitingTime: number;
  turnaroundTime: number;
  memoryStart: number;
  cpuAssigned: number;
  executed: boolean;
}

export interface MemoryBlock {
  start: number;
  size: number;
  processId: number | null;
}

export interface GanttEntry {
  cpu: number;
  processId: number;
  start: number;
  end: number;
}

export interface MemoryLog {
  processId: number;
  start: number;
  end: number;
  allocatedAt: number;
  deallocatedAt: number;
}

export interface SimulationConfig {
  numProcesses: number;
  numCPUs: number;
  memoryFitAlgorithm: 1 | 2 | 3; // 1=First Fit, 2=Best Fit, 3=Worst Fit
  schedulingAlgorithm: 1 | 2 | 3 | 4; // 1=FCFS, 2=SJF, 3=Priority, 4=Round Robin
  isPreemptive: boolean;
  quantum: number;
  totalMemory: number;
}

export interface SimulationResult {
  processes: Process[];
  ganttChart: GanttEntry[];
  memoryLogs: MemoryLog[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  cpuCount: number;
}

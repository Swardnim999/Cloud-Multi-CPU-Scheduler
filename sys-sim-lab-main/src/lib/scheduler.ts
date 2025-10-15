import { Process, GanttEntry, SimulationConfig } from './types';
import { MemoryManager } from './memoryManager';

export class Scheduler {
  private config: SimulationConfig;
  private processes: Process[];
  private readyQueue: Process[];
  private ganttChart: GanttEntry[];
  private currentTime: number;
  private cpuStatus: (Process | null)[];
  private memoryManager: MemoryManager;

  constructor(config: SimulationConfig, processes: Process[]) {
    this.config = config;
    this.processes = processes.map(p => ({
      ...p,
      remainingTime: p.burstTime,
      startTime: -1,
      completionTime: -1,
      waitingTime: 0,
      turnaroundTime: 0,
      memoryStart: -1,
      cpuAssigned: -1,
      executed: false
    }));
    this.readyQueue = [];
    this.ganttChart = [];
    this.currentTime = 0;
    this.cpuStatus = Array(config.numCPUs).fill(null);
    this.memoryManager = new MemoryManager(config.totalMemory, config.memoryFitAlgorithm);
  }

  simulate() {
    while (this.hasRemainingProcesses()) {
      // Add arriving processes to ready queue
      this.addArrivingProcesses();

      // Execute on each CPU
      for (let cpu = 0; cpu < this.config.numCPUs; cpu++) {
        this.executeCPU(cpu);
      }

      this.currentTime++;
    }

    // Calculate final stats
    this.calculateStatistics();

    return {
      processes: this.processes,
      ganttChart: this.ganttChart,
      memoryLogs: this.memoryManager.getLogs(),
      avgWaitingTime: this.calculateAverageWaitingTime(),
      avgTurnaroundTime: this.calculateAverageTurnaroundTime(),
      cpuCount: this.config.numCPUs
    };
  }

  private addArrivingProcesses(): void {
    const arriving = this.processes.filter(
      p => p.arrivalTime === this.currentTime && !p.executed && p.memoryStart === -1
    );

    for (const process of arriving) {
      const memStart = this.memoryManager.allocate(
        process.pid,
        process.memoryRequired,
        this.currentTime
      );
      
      if (memStart !== -1) {
        process.memoryStart = memStart;
        this.readyQueue.push(process);
      }
    }

    this.sortReadyQueue();
  }

  private executeCPU(cpu: number): void {
    const current = this.cpuStatus[cpu];

    // Check if current process finished or needs preemption
    if (current) {
      if (current.remainingTime === 0) {
        this.completeProcess(current, cpu);
        this.cpuStatus[cpu] = null;
      } else if (this.shouldPreempt(current, cpu)) {
        this.readyQueue.push(current);
        this.cpuStatus[cpu] = null;
        this.sortReadyQueue();
      }
    }

    // Assign new process if CPU is idle
    if (this.cpuStatus[cpu] === null && this.readyQueue.length > 0) {
      const nextProcess = this.readyQueue.shift()!;
      this.cpuStatus[cpu] = nextProcess;
      nextProcess.cpuAssigned = cpu + 1;
      
      if (nextProcess.startTime === -1) {
        nextProcess.startTime = this.currentTime;
      }
    }

    // Execute current process
    if (this.cpuStatus[cpu]) {
      const process = this.cpuStatus[cpu]!;
      this.addGanttEntry(cpu + 1, process.pid, this.currentTime);
      process.remainingTime--;
    }
  }

  private shouldPreempt(current: Process, cpu: number): boolean {
    if (!this.config.isPreemptive) return false;

    if (this.config.schedulingAlgorithm === 4) {
      // Round Robin preemption
      const lastEntry = this.ganttChart.filter(
        g => g.cpu === cpu + 1 && g.processId === current.pid
      ).pop();
      
      if (lastEntry) {
        const timeSlice = this.currentTime - lastEntry.start;
        if (timeSlice >= this.config.quantum) {
          return true;
        }
      }
    } else if (this.config.schedulingAlgorithm === 2 && this.readyQueue.length > 0) {
      // SJF preemption
      const shortest = this.readyQueue[0];
      return shortest.remainingTime < current.remainingTime;
    } else if (this.config.schedulingAlgorithm === 3 && this.readyQueue.length > 0) {
      // Priority preemption
      const highest = this.readyQueue[0];
      return highest.priority < current.priority;
    }

    return false;
  }

  private completeProcess(process: Process, cpu: number): void {
    process.completionTime = this.currentTime;
    process.executed = true;
    this.memoryManager.deallocate(process.pid, this.currentTime);
  }

  private addGanttEntry(cpu: number, processId: number, time: number): void {
    const lastEntry = this.ganttChart[this.ganttChart.length - 1];
    
    if (lastEntry && lastEntry.cpu === cpu && lastEntry.processId === processId && lastEntry.end === time) {
      lastEntry.end = time + 1;
    } else {
      this.ganttChart.push({
        cpu,
        processId,
        start: time,
        end: time + 1
      });
    }
  }

  private sortReadyQueue(): void {
    switch (this.config.schedulingAlgorithm) {
      case 1: // FCFS
        this.readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
        break;
      case 2: // SJF
        this.readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        break;
      case 3: // Priority
        this.readyQueue.sort((a, b) => a.priority - b.priority);
        break;
      case 4: // Round Robin
        // Keep FIFO order
        break;
    }
  }

  private calculateStatistics(): void {
    for (const process of this.processes) {
      if (process.completionTime !== -1) {
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
      }
    }
  }

  private calculateAverageWaitingTime(): number {
    const completed = this.processes.filter(p => p.completionTime !== -1);
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, p) => sum + p.waitingTime, 0);
    return total / completed.length;
  }

  private calculateAverageTurnaroundTime(): number {
    const completed = this.processes.filter(p => p.completionTime !== -1);
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
    return total / completed.length;
  }

  private hasRemainingProcesses(): boolean {
    return this.processes.some(p => p.remainingTime > 0 || p.arrivalTime > this.currentTime);
  }
}

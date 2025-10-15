import { MemoryBlock, MemoryLog } from './types';

export class MemoryManager {
  private blocks: MemoryBlock[];
  private logs: MemoryLog[];
  private totalMemory: number;
  private fitAlgorithm: 1 | 2 | 3;

  constructor(totalMemory: number, fitAlgorithm: 1 | 2 | 3) {
    this.totalMemory = totalMemory;
    this.fitAlgorithm = fitAlgorithm;
    this.blocks = [{ start: 0, size: totalMemory, processId: null }];
    this.logs = [];
  }

  allocate(processId: number, size: number, currentTime: number): number {
    let chosenBlock: MemoryBlock | null = null;

    const freeBlocks = this.blocks.filter(b => b.processId === null && b.size >= size);
    
    if (freeBlocks.length === 0) return -1;

    if (this.fitAlgorithm === 1) {
      // First Fit
      chosenBlock = freeBlocks[0];
    } else if (this.fitAlgorithm === 2) {
      // Best Fit
      chosenBlock = freeBlocks.reduce((best, current) => 
        current.size < best.size ? current : best
      );
    } else {
      // Worst Fit
      chosenBlock = freeBlocks.reduce((worst, current) => 
        current.size > worst.size ? current : worst
      );
    }

    if (!chosenBlock) return -1;

    const allocatedStart = chosenBlock.start;
    
    // Split the block
    const index = this.blocks.indexOf(chosenBlock);
    this.blocks.splice(index, 1);
    
    this.blocks.push({
      start: allocatedStart,
      size: size,
      processId: processId
    });
    
    if (chosenBlock.size > size) {
      this.blocks.push({
        start: allocatedStart + size,
        size: chosenBlock.size - size,
        processId: null
      });
    }
    
    this.blocks.sort((a, b) => a.start - b.start);

    this.logs.push({
      processId,
      start: allocatedStart,
      end: allocatedStart + size,
      allocatedAt: currentTime,
      deallocatedAt: -1
    });

    return allocatedStart;
  }

  deallocate(processId: number, currentTime: number): void {
    const blockIndex = this.blocks.findIndex(b => b.processId === processId);
    if (blockIndex === -1) return;

    const block = this.blocks[blockIndex];
    block.processId = null;

    // Update log
    const log = this.logs.find(l => l.processId === processId && l.deallocatedAt === -1);
    if (log) {
      log.deallocatedAt = currentTime;
    }

    // Merge adjacent free blocks
    this.mergeBlocks();
  }

  private mergeBlocks(): void {
    let i = 0;
    while (i < this.blocks.length - 1) {
      const current = this.blocks[i];
      const next = this.blocks[i + 1];
      
      if (current.processId === null && next.processId === null) {
        current.size += next.size;
        this.blocks.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }

  getFreeBlocks(): { start: number; end: number; size: number }[] {
    return this.blocks
      .filter(b => b.processId === null)
      .map(b => ({
        start: b.start,
        end: b.start + b.size,
        size: b.size
      }));
  }

  getUsedBlocks(): { start: number; end: number; size: number; processId: number }[] {
    return this.blocks
      .filter(b => b.processId !== null)
      .map(b => ({
        start: b.start,
        end: b.start + b.size,
        size: b.size,
        processId: b.processId!
      }));
  }

  getLogs(): MemoryLog[] {
    return this.logs;
  }
}

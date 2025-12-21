export type RecordedStep = {
  action: 'click' | 'type' | 'assert';
  logicalName: string;
  value?: string;
  selector: string;
};

class ExecutionRecorder {
  private steps: RecordedStep[] = [];

  record(step: RecordedStep) {
    this.steps.push(step);
  }

  getSteps() {
    return [...this.steps];
  }

  clear() {
    this.steps = [];
  }
}

export const recorder = new ExecutionRecorder();

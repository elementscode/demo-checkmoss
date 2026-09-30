import { Job } from "@elements/app";
import { sweepFlags } from "#app/shared/services/games";

export class SweepFlagsJob extends Job {
  static maxAttempts = 1;

  run() {
    sweepFlags();
  }
}

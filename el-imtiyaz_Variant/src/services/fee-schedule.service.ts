/**
 * Fee Schedule Service — manages the school's pricing tiers.
 *
 * The Excel workbook encodes fees implicitly inside cell formulas
 * (e.g. =25000+205000+35000-J2). This service makes those tiers
 * explicit & editable. When a schedule changes, every linked ledger
 * entry should re-evaluate.
 *
 * ── Iteration 3 (issues 12 + 14): event-driven recomputation ──
 *
 * The previous version used a late-injection back-channel:
 *     services.feeSchedule["ledger"] = services.ledger;
 * in `src/main/ipc/index.ts`. This bypassed TypeScript's type system
 * (the `FeeScheduleService` declared `ledger: LedgerService | null`)
 * and created a hidden circular dependency:
 *
 *     LedgerService → FeeScheduleRepository (to get pricing)
 *     FeeScheduleService → LedgerService (to trigger recomputation)
 *
 * We now publish a `feeSchedule.changed` event on the EventBus when
 * pricing changes. LedgerService subscribes to that event and calls
 * its own `recomputeAll()`. This is the proper DI pattern — no late
 * injection, no private-property assignment, no circular reference.
 *
 * The legacy `ledger` field is kept (deprecated) for backward
 * compatibility with any caller that still sets it directly, but the
 * preferred path is via the EventBus.
 */

import { FeeScheduleRepository, FeeScheduleQuery } from "../infrastructure/repositories/fee-schedule.repository";
import type {
  FeeSchedule,
  FeeScheduleLine,
  CreateFeeScheduleInput,
  UpdateFeeScheduleInput,
} from "../core/entities/fee-schedule.entity";
import { DEFAULT_FEE_SCHEDULE } from "../core/entities/fee-schedule.entity";
import type { IEventBus } from "../core/interfaces/event-bus.interface";
import type { LedgerService } from "./ledger.service";
import { NotFoundError, ValidationError } from "../infrastructure/error/app-error";
import { logger } from "../infrastructure/logger/logger";

export class FeeScheduleService {
  readonly serviceName = "FeeScheduleService";

  /**
   * @deprecated since iteration 3 (issues 12 + 14). Use the EventBus
   * `feeSchedule.changed` subscription instead. The field is kept so
   * existing callers that set it directly still work, but the
   * preferred path is to let LedgerService subscribe to the event.
   */
  public ledger: LedgerService | null = null;

  constructor(
    private readonly schedules: FeeScheduleRepository,
    private readonly eventBus?: IEventBus,
    ledger?: LedgerService
  ) {
    if (ledger) this.ledger = ledger;
  }

  async list(query: FeeScheduleQuery = {}): Promise<FeeSchedule[]> {
    return this.schedules.list(query);
  }

  async getById(id: string): Promise<FeeSchedule> {
    const s = await this.schedules.findById(id);
    if (!s) throw new NotFoundError("FeeSchedule", id);
    return s;
  }

  async getActive(): Promise<FeeSchedule | null> {
    return this.schedules.findActive();
  }

  async create(input: CreateFeeScheduleInput): Promise<FeeSchedule> {
    if (!input.name?.trim()) throw new ValidationError("Schedule name is required");
    if (!input.gradeLevel?.trim()) throw new ValidationError("Grade level is required");
    if (!input.lines?.length) throw new ValidationError("Schedule must have at least one line");

    const schedule = await this.schedules.create(input);

    logger.info("feeSchedule.created", {
      id: schedule.id.value,
      name: schedule.name,
      gradeLevel: schedule.gradeLevel,
      lineCount: schedule.lines.length,
    });

    return schedule;
  }

  async update(id: string, patch: UpdateFeeScheduleInput): Promise<FeeSchedule> {
    const before = await this.getById(id);
    const updated = await this.schedules.update(id, patch);

    // If pricing changed, recompute every ledger entry that uses this schedule.
    if (
      patch.lines !== undefined ||
      (patch.isActive === true && !before.isActive)
    ) {
      logger.info("feeSchedule.changed", { id });

      // ── Iteration 3 (issues 12 + 14): event-driven recomputation ──
      //
      // Publish a `feeSchedule.changed` event. LedgerService subscribes
      // to this event and calls its own `recomputeAll()`. This removes
      // the late-injection back-channel (`services.feeSchedule["ledger"]
      // = services.ledger`) that previously bypassed the type system
      // and created a circular reference.
      //
      // The legacy `this.ledger?.recomputeAll()` call is kept as a
      // fallback for callers that still set the deprecated `ledger`
      // field directly. Both paths are idempotent — recomputeAll()
      // just re-evaluates every row — but only ONE should run. We
      // prefer the EventBus path when an eventBus is configured; we
      // fall back to the direct call only when no bus is available
      // (e.g. in a unit test that wires the services manually).
      if (this.eventBus) {
        await this.eventBus.publish("feeSchedule.changed", {
          scheduleId: id,
          before,
          after: updated,
          actor: { actorId: "system", actorName: "System" },
        });
      } else if (this.ledger) {
        await this.ledger.recomputeAll();
      } else {
        logger.warn("feeSchedule.changed.noListener", {
          id,
          hint: "No eventBus and no legacy ledger reference — recompute was skipped",
        });
      }
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.schedules.delete(id);
    logger.info("feeSchedule.deleted", { id });
  }

  /**
   * Bootstrap a default schedule from the Excel constants if none exists.
   * Called on first run by the bootstrap pipeline.
   */
  async ensureDefaultExists(): Promise<FeeSchedule> {
    const existing = await this.schedules.findActive();
    if (existing) return existing;

    return this.create({
      name: "Default (Excel 2026-2027)",
      description: "Auto-created from the implicit pricing in the Suivis clients.xlsx workbook",
      gradeLevel: "ALL",
      lines: DEFAULT_FEE_SCHEDULE.map((l) => ({ ...l })),
      isActive: true,
    });
  }

  /**
   * Resolve the fee for a specific line type from a schedule (or from
   * the default if none provided). Used by the LedgerService.
   */
  resolveLineAmount(
    schedule: FeeSchedule | null,
    type: FeeScheduleLine["type"]
  ): number {
    if (!schedule) {
      const def = DEFAULT_FEE_SCHEDULE.find((l) => l.type === type);
      return def?.amount ?? 0;
    }
    return schedule.lines.find((l) => l.type === type)?.amount ?? 0;
  }
}

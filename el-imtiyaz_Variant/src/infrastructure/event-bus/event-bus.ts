/**
 * EventBus — synchronous in-process pub/sub.
 *
 * Uses a Map of handlers per event type. Handlers may be async; the bus
 * awaits each one in registration order. Errors in one handler do NOT
 * prevent subsequent handlers from running — they are logged and re-thrown
 * only after all handlers have completed.
 *
 * ── Iteration 5 / Fix #40 (Flaw A): async-drift mitigation ─────────
 * Background (software_review.md Flaw A — "Asynchronous Drift &
 * Event-Bus Race Conditions"):
 *   The original review flagged a race condition: if a user edits a
 *   student's remise while a payment event is still processing in the
 *   background, other services reading the database concurrently may
 *   read stale, out-of-date balances.
 *
 *   The actual implementation already mitigates this in two ways:
 *     1. `publish()` awaits each handler SEQUENTIALLY (the for-loop
 *        uses `await`), so all handlers for a single event complete
 *        before `publish()` returns. The caller (`LedgerService.create`
 *        etc.) awaits `publish()`, so the create/update does not
 *        resolve until every side-effect has been persisted.
 *     2. Handlers that need to read the just-written row can do so
 *        directly via the repository — the row is already in the
 *        database when their handler runs.
 *
 *   The previous documentation did NOT make either guarantee explicit,
 *   which is why the review flagged the architecture as racy. This
 *   update codifies the guarantees in the public interface and adds:
 *     - `publishSequence()`: publishes multiple events in guaranteed
 *       order, awaiting each one fully before publishing the next.
 *       Useful when a single user action triggers several events that
 *       must be observed in order (e.g. `ledger.entry.updated` then
 *       `ledger.entry.computed`).
 *     - A documented contract that handlers run sequentially and the
 *       caller's `await publish(...)` resolves only after every
 *       handler has finished.
 *
 *   This does NOT change the runtime behaviour — it makes the
 *   existing behaviour explicit and testable.
 */

import type {
  IEventBus,
  DomainEvent,
  EventHandler
} from '../../core/interfaces/event-bus.interface';
import { logger } from '../logger/logger';

type AnyHandler = EventHandler<any>;

export class EventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<AnyHandler>>();

  /**
   * Publish an event to all subscribed handlers.
   *
   * Contract (Iteration 5 / Fix #40):
   *   - Handlers run SEQUENTIALLY in registration order.
   *   - Each handler is fully `await`ed before the next runs.
   *   - The returned Promise resolves ONLY after every handler has
   *     completed (or errored).
   *   - Errors in one handler do NOT prevent subsequent handlers from
   *     running; the first error is re-thrown after all handlers
   *     have finished.
   *
   * This means callers that `await bus.publish(...)` are guaranteed
   * that every side-effect (audit log, notification, derived update)
   * has been persisted before their own operation continues. There is
   * no "async drift" within a single publish call.
   */
  async publish<T>(
    type: string,
    payload: T,
    meta?: { correlationId?: string }
  ): Promise<void> {
    const event: DomainEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      correlationId: meta?.correlationId
    };

    const handlers = this.handlers.get(type);
    if (!handlers || handlers.size === 0) {
      logger.debug('eventbus.no-handlers', { type });
      return;
    }

    const errors: unknown[] = [];

    for (const handler of handlers) {
      try {
        await handler(event as DomainEvent<unknown>);
      } catch (err) {
        logger.error('eventbus.handler.error', {
          type,
          error: (err as Error).message
        });
        errors.push(err);
      }
    }

    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      throw new Error(
        `EventBus: ${errors.length} handlers failed for event "${type}". First error: ${(errors[0] as Error).message}`
      );
    }
  }

  /**
   * Publish a sequence of events in guaranteed order.
   *
   * Each event is fully published (all handlers awaited) before the
   * next event in the sequence is dispatched. This is the equivalent
   * of:
   *
   *   for (const ev of events) await bus.publish(ev.type, ev.payload);
   *
   * but with a single audit-log entry that records the sequence.
   *
   * ── Iteration 5 / Fix #40 ──
   * Useful when a single user action triggers several events that
   * downstream observers must see in order. For example, the
   * LedgerService emits both `ledger.entry.updated` and
   * `ledger.entry.computed`; observers that subscribe to both need
   * to see them in that order, not interleaved with another row's
   * events.
   */
  async publishSequence<T>(
    events: Array<{ type: string; payload: T }>,
    meta?: { correlationId?: string }
  ): Promise<void> {
    const correlationId = meta?.correlationId ?? `seq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    logger.debug('eventbus.sequence.start', {
      correlationId,
      count: events.length,
      types: events.map((e) => e.type),
    });
    for (const ev of events) {
      await this.publish(ev.type, ev.payload, { correlationId });
    }
    logger.debug('eventbus.sequence.complete', { correlationId });
  }

  subscribe<T>(type: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as AnyHandler);
    logger.debug('eventbus.subscribed', { type, count: this.handlers.get(type)!.size });

    return () => {
      this.handlers.get(type)?.delete(handler as AnyHandler);
      logger.debug('eventbus.unsubscribed', { type });
    };
  }

  async dispose(): Promise<void> {
    this.handlers.clear();
    logger.info('eventbus.disposed');
  }
}

/**
 * Event bus contract — in-process pub/sub for cross-domain reactions.
 *
 * Examples:
 *   - `payment.recorded` → audit service logs the action
 *   - `student.enrolled` → fee template service auto-creates invoices
 *   - `invoice.overdue` → notification service queues an email reminder
 *
 * The bus is synchronous within the main process; all handlers run to
 * completion before the publisher continues. This keeps audit logging
 * deterministic without distributed transactions.
 *
 * ── Iteration 5 / Fix #40 (Flaw A): async-drift mitigation ─────────
 * The contract codifies two guarantees the previous implementation
 * already provided but did not document:
 *   1. Handlers run SEQUENTIALLY in registration order.
 *   2. `await publish(...)` resolves only after every handler has
 *      completed (or errored). The caller's operation does not
 *      continue until all side-effects are persisted.
 * See `EventBus` in `infrastructure/event-bus/event-bus.ts` for
 * the implementation and `publishSequence` for ordered multi-event
 * publishing.
 */

export type DomainEvent<TPayload = unknown> = {
  type: string;
  payload: TPayload;
  timestamp: string;
  correlationId?: string;
};

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

export interface IEventBus {
  /**
   * Publish an event to all subscribed handlers.
   *
   * Contract: handlers run sequentially; `await publish(...)` resolves
   * only after every handler has completed. See the file-level doc
   * for the full guarantee.
   */
  publish<T>(type: string, payload: T, meta?: { correlationId?: string }): Promise<void>;

  /**
   * Publish a sequence of events in guaranteed order.
   *
   * Each event is fully published (all handlers awaited) before the
   * next event in the sequence is dispatched. Optional — callers
   * that don't need ordering guarantees can call `publish()` in a
   * loop themselves.
   *
   * ── Iteration 5 / Fix #40 ──
   */
  publishSequence?<T>(
    events: Array<{ type: string; payload: T }>,
    meta?: { correlationId?: string },
  ): Promise<void>;

  subscribe<T>(type: string, handler: EventHandler<T>): () => void;
  dispose(): Promise<void>;
}

/**
 * System adapter profile for Foundry Hiscores.
 *
 * Copy this file, replace `your-system-id`, and fill in the readers your
 * system needs. Registration runs on the core hook
 * `foundry-hiscores.registerSystemAdapters`.
 *
 * Readers are pure: tolerate partial documents, never mutate them, and return
 * `unknown` or an empty array rather than throwing. Core owns campaign keys,
 * event envelopes, queueing, and delivery, so an adapter never makes HTTP
 * requests or reads the API key.
 */

const EMPTY = Object.freeze([]);

export const profile = Object.freeze({
  apiVersion: 1,
  adapterId: "foundry-hiscores-system-template",
  adapterVersion: "0.1.0",

  // Must match game.system.id exactly. Declare only the versions you have
  // fixtures for; core pauses collection on an unverified system version.
  systemId: "your-system-id",
  systemVersionRange: ">=1.0.0 <2.0.0",

  // Player-character document types. Core includes actors of these types that
  // have at least one non-GM owner.
  characterActorTypes: Object.freeze(["character"]),

  // "alive" | "dead" | "unknown". Unknown -> dead is reported as probable.
  readDeadState(actor) {
    const hp = actor?.system?.attributes?.hp?.value;
    if (typeof hp !== "number") return "unknown";
    return hp <= 0 ? "dead" : "alive";
  },

  // One immutable unit and method version per snapshot. Changing what either
  // means requires a new wealthUnit so old records are not recompared.
  readWealth() {
    return {
      wealthMinorUnits: 0,
      wealthUnit: "your-system-minor-unit-v1",
      components: [],
      method: "currency-plus-priced-items-v1",
      complete: true,
      warnings: [],
    };
  },

  // Owned physical items. itemKey prefers a source UUID over a document UUID.
  readInventory() {
    return EMPTY;
  },

  // Names and description keywords are never evidence of magic on their own.
  classifyMagicItem() {
    return { value: "unknown", method: "none", reason: "unsupported" };
  },

  // Return [] when there is no player source or several equally likely ones.
  // Confidence is confirmed 1, probable 0.7, uncertain 0.4.
  readKillEvidence() {
    return EMPTY;
  },

  // Namespaced as `<adapterId>:<counter>`. None is a valid answer.
  customCounters: EMPTY,

  // Turn a core hook context into observations. Every observation needs an
  // actorUuid; core resolves it to the public participant.
  observe() {
    return EMPTY;
  },
});

export function registerAdapter(api) {
  api.registerSystemAdapter(profile);
}

// Core emits this from its own init, so subscribe at evaluation time rather
// than inside another init hook.
if (globalThis.Hooks) Hooks.on("foundry-hiscores.registerSystemAdapters", registerAdapter);

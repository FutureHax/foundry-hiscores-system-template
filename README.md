# Foundry Hiscores system adapter template

Copy this repo, rename three strings, edit the profile object in `scripts/profile.js`, install alongside [Foundry Hiscores](https://github.com/FutureHax/foundry-hiscores).

**Prerequisites:** Foundry v13+, Oh You Dead! 1.1.0+, Foundry Hiscores (core), and your target system installed in the dev world.

## Quick start

1. **Use this template** on GitHub ([`FutureHax/foundry-hiscores-system-template`](https://github.com/FutureHax/foundry-hiscores-system-template)).
2. **Rename** in `module.json`: `id`, `title`, `relationships.systems[0].id`, manifest URLs.
3. **Edit** `scripts/profile.js`: `adapterId`, `systemId`, `systemVersionRange`, and the readers your system needs.
4. **Install** core + your adapter in `Data/modules/`, enable both, configure a campaign, and confirm the status panel reports `ready`.

Registration is already wired in `scripts/profile.js`:

```javascript
export function registerAdapter(api) {
  api.registerSystemAdapter(profile);
}

Hooks.on("foundry-hiscores.registerSystemAdapters", registerAdapter);
```

Core emits that hook from its own `init`, so subscribe at module evaluation time rather than inside another `init` hook.

Official adapters with complete readers: [Pirate Borg](https://github.com/FutureHax/foundry-hiscores-pirateborg), [dnd5e](https://github.com/FutureHax/foundry-hiscores-dnd5e).

## Adapter profile checklist

| Key | Purpose |
|-----|---------|
| `apiVersion` | Must equal the core API major, currently `1` |
| `adapterId` | Your stable module ID |
| `adapterVersion` | Semver, stamped on every event |
| `systemId` | Must match `game.system.id` |
| `systemVersionRange` | Semver range you have fixtures for |
| `characterActorTypes` | Player-character document types |
| `readDeadState(actor)` | `alive`, `dead`, or `unknown` |
| `readWealth(actor)` | Wealth snapshot in minor units |
| `readInventory(actor)` | Owned physical items |
| `classifyMagicItem(item)` | `magic`, `not-magic`, or `unknown` with a reason |
| `readKillEvidence(context)` | Kill candidates, or empty |
| `customCounters` | Namespaced counter definitions, or empty |
| `observe(context)` | Core hook context to observations |

Readers must be pure: tolerate partial documents, never mutate them, and degrade to `unknown`, an incomplete snapshot, or no observation instead of throwing. An adapter never reads the API key, makes HTTP requests, or writes the queue.

## Data shapes

A wealth snapshot carries one immutable unit and method version:

```json
{
  "wealthMinorUnits": 12500,
  "wealthUnit": "dnd5e-copper-v1",
  "components": [{ "kind": "currency", "key": "gp", "quantity": 100, "unitValue": 100 }],
  "method": "currency-plus-priced-items-v1",
  "complete": true,
  "warnings": []
}
```

`complete: false` still stores the snapshot but drops it from wealth ranking and deltas. Changing what a unit or method means requires a new `wealthUnit` so historical records are not recompared under a new definition.

Magic classification runs in priority order: an explicit system magic property, then system rarity or type semantics, then your own category mapping, then `unknown`. Item names and description keywords never yield `magic` on their own.

Kill confidence is exactly `confirmed` 1.0, `probable` 0.7, and `uncertain` 0.4. Emit nothing when there is no player source or several equally plausible ones.

Every observation needs an `actorUuid`. Core resolves it to the public participant and owns the envelope, queue, and `{ "events": [...] }` wrapper.

## API reference

On `game.modules.get("foundry-hiscores").api`:

- `registerSystemAdapter(profile)`
- `getActiveAdapter()`
- `getStatus()`
- `requestSnapshot()`
- `enqueueObservation(observation)`
- `retryNow()`

Full contract: [Foundry Hiscores SPEC](https://github.com/FutureHax/foundry-hiscores/blob/main/docs/SPEC.md).

## Test

1. Enable Oh You Dead!, Foundry Hiscores (core), and your adapter.
2. Create a campaign on the Foundry Hiscores site and enter the campaign ID and API key as a GM.
3. Confirm the status panel reports `ready` and names your adapter.
4. Play a session and confirm your campaign page updates.

Submitted campaign and character data is public.

## License

MIT

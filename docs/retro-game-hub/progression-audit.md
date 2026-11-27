# Player progression follow-up

| Surface | Verified evidence | Next check |
| --- | --- | --- |
| Profile totals and game rows | Both profile XP readers previously stopped at the REST row cap. The profile list also excluded all 14 Classics IDs. Cursor pagination and the missing rows are covered by a 260-award synthetic ledger with a 100-row API cap. | Compare hub and header totals with the profile on large accounts in an isolated stack. See GH-20. |
| Overall and per-game rankings | The opt-in RPC derives XP and time from server records. Per-game requests require a game in the reward catalog. Classic scoring has no verified competitive ranking contract. | Verify consent, ordering, and eligible metrics with synthetic accounts. See GH-36. |
| Completion and time | Completion proof is game-specific. Shared presence is bounded visible-page time, separate from completion and XP. The recovered Classics migration includes the missing allowlist. | Exercise hidden-tab resume and per-game time in a real browser. See GH-23 through GH-26. |
| Daily best | Isolated replay passed concurrent duplicate submissions for Heads or Tails and Memory Match. The ledger is the authoritative XP record. | Expand to best improvements, UTC rollover, and Cornhole match/placement coverage. See GH-19, GH-21, GH-52 and GH-64. |
| Wearables and badges | Existing migrations grant catalog entitlements from server-owned milestones and constrain equipping through ownership policies. | Verify thresholds and equip persistence in isolated end-to-end tests, starting with Cornhole GH-119. |

Prioritize account persistence and isolation, reward consistency and retries, then gameplay blockers and mobile controls. Keep unreproduced Jira QA cases open. The profile changes do not introduce new awards or alter eligibility.

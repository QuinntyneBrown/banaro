# Implementation decisions

The detailed designs leave some points as `<TO SUPPLY>`, and in places the spec, design and mock
disagree. While implementing, each such point is settled by one rule:

1. The L2 specification wins over the detailed design, and the design wins over the mock.
2. Where the specification is silent, the mock's copy and behaviour apply.
3. Where neither settles it, the safer option applies: less data collected or sent, tighter limits,
   no message to an address Banaro has not verified.

Each decision below names the open point, the decision and the rule that settled it. Review them;
a different answer becomes a requirement or design change and then a code change.

| # | Feature | Open point | Decision | Rule |
|---|---------|------------|----------|------|
| D-001 | localize-and-format | Home matching examples show "26.9 km" and "17.8 km" in the mock | Shown as "27 km" and "18 km": L2-052 criterion 3 drops the decimal from 10 km | 1 |
| D-002 | adapt-responsive-layout | Mock header "Join Banaro" (36 px) and brand link (32 px) are under 44 px | Below 576 px small buttons and the brand link are 44 px tall (L2-049 criterion 1) | 1 |
| D-003 | switch-theme | No mock for a visible theme switch | Only the `t` shortcut and the stored cookie ship; the switch waits for a mock | 1 |
| D-004 | about-and-contact | No faith-position section in the about mock | A "What we believe" section states the faith position in plain language; copy to review | 1 |
| D-005 | about-and-contact | Land acknowledgement only in the footer | Also shown on `/about` under "Where we are" | 1 |

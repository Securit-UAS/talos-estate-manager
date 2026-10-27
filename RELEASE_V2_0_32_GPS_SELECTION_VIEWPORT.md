# TALOS V2.0.32 — GPS trace selection and viewport

- No GPS trace is selected automatically after importing, changing site, shift type or week.
- Selecting a dated shift/trace resets playback to the beginning and fits the map to every valid coordinate for the selected traces, independent of playback position.
- Follow Active Position is always off when the module opens.
- Initial zoom covers the complete selected data extent (maximum zoom 19), not a hard-coded site location.
- Existing manual CSV import, seven-trace overlay, and other TALOS modules retained.
- UAT build; requires deployment browser verification.

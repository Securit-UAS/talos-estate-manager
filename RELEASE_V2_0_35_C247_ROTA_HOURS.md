# TALOS Unified V2.0.35 — C247 rota-bounded hours (UAT)

Based on V2.0.34, retaining GPS visual refinements.

## Changed
- C247 Reporting now displays Rota hours and Worked hours (capped).
- CSV export includes RotaHours, WorkedHoursCapped, TimeLost, HoursStatus alongside the unmodified C247 roster/booking timestamps.
- Worked minutes are the nonnegative overlap of [book on, book off] and [rota start, rota finish]; capped at scheduled minutes. Late book-on / early book-off reduce worked minutes. Early on/late off do not inflate hours.
- Auto book-off 60 minutes after scheduled end has no effect on capped minutes. A timestamp alone does not prove automation and no auto flag was asserted.
- Missing or inconsistent bookings show an unavailable worked duration rather than assuming a full shift.
- Interprets a same-date finish earlier than the start as an overnight finish; flags invalid or implausible rota windows for review.

## UAT test cases
07:00-19:00 / 06:45-19:15 => 12h00; / 07:15-19:00 => 11h45; / 07:00-18:30 => 11h30; / 07:15-18:45 => 11h30; / 07:00-20:00 (auto +60) => 12h00; missing booking off => unavailable.

Calculation is a scheduled-window attendance measure, NOT a definitive payroll payment, contractual billing, or proof of physical presence.

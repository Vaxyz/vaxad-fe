# Vaxad Frontend — Vertical Feature Baseline

This frontend is aligned with the verified V7 backend baseline.

## Included vertical features

- Authentication / protected application shell
- Dashboard
- Academic sessions and terms
- Subjects, classes and teaching assignments
- Teacher management
- Students and guardians
- Student enrollment
- Student attendance
- Teacher attendance
- Admissions
- Assessment configuration
- Score entry and approval
- Grading and result calculation
- Result publication
- Timetable configuration, builder, views and publication
- Facilities
- Fees, charges, payments, receipts and reconciliation
- Student financial accounts

## API

All application requests use RTK Query and attach the JWT from the Redux auth state. The API base defaults to `http://localhost:8080/api/v1` and can be overridden with `VITE_API_URL`.

## Backend compatibility

No backend Java source or Flyway migration is changed by this frontend increment. V1–V7 remain the backend baseline.

## V17 — Inventory & Procurement

The V17 inventory workspace is available at `/inventory` and is backed by the `/api/v1/inventory` RTK Query endpoints.

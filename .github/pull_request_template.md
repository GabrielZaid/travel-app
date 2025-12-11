
# Pull Request Template

## 🔗 Related Issue
<!-- Reference open issues as #123. Use `Fixes #123` when this PR closes it. -->

## 📝 Summary
<!-- Explain the intent of this PR in 2-3 bullet points. Mention the main modules touched (backend NestJS, frontend Angular, shared, etc.). -->

## 📦 Scope of Changes
<!-- Mark all that apply. -->
- [ ] Backend (NestJS / `backend/`)
- [ ] Frontend (Angular / `frontend/`)
- [ ] Shared types or constants
- [ ] Tooling / configuration / CI
- [ ] Documentation or guides
- [ ] Breaking change (impacts existing contracts or APIs)

## ✅ Testing & Verification
<!-- List every command or manual check you ran. Include pnpm commands where possible. -->
| Area      | Command / Action                                   | Result |
|-----------|----------------------------------------------------|--------|
| Backend   | `pnpm --filter backend lint`                       |        |
| Backend   | `pnpm --filter backend test` / `pnpm test:e2e`     |        |
| Frontend  | `pnpm --filter frontend test` / `pnpm --filter frontend build` |        |
| Manual    | e.g. Hit Amadeus API, run app locally, capture logs |        |

## 📸 Evidence / Screenshots
<!-- Add UI captures, logs, or leave N/A. -->

## ☑️ Checklist

- [ ] Issue linked or rationale provided
- [ ] Tests added/updated for new logic
- [ ] Lint/build scripts run and passing
- [ ] Environment variables / secrets documented if changed
- [ ] New APIs or contracts documented (README, Swagger, etc.)

## 📚 Extra Notes
<!-- Optional: call out migration steps, follow-ups, or reviewer guidance. -->

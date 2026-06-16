# Day 17 Trainer Script — GitHub Actions CI and Deployment Foundations

Fullstack Training Program  
Mini Business Operations App

---

## Trainer Positioning

Day 17 starts the automation and deployment-readiness part of Week 4.

By now, students have already worked through the main project flow:

- Product and Customer master data
- Sales order schema
- Sales order creation
- Sales order confirmation
- Stock validation
- Stock movement records
- Backend service/unit tests
- Backend API or integration testing foundation
- Frontend behavior tests
- Frontend polish and environment configuration

Day 17 should connect testing to professional workflow.

The key message for the day:

> Tests are useful locally, but they become much more valuable when they run automatically before code is merged.

A second key message is required today:

> Integration tests need their dependencies. If backend integration tests need PostgreSQL, CI must provide a temporary PostgreSQL database instead of silently skipping the tests.

Today is not full Hostinger deployment. Do not ask students to add real Hostinger credentials, SSH keys, or production database URLs.

Today should create:

- A working CI workflow
- Separate backend unit and integration test jobs
- A PostgreSQL service container for integration tests
- Prisma migration execution against the CI test database
- Safe deployment workflow placeholders
- README documentation for CI, test database setup, and deployment secrets

Actual deployment configuration should be handled carefully by the trainer or senior developer.

---

## Day Goal

By the end of Day 17, students should be able to:

1. Explain Continuous Integration in simple terms.
2. Explain why CI protects the main branch.
3. Explain what GitHub Actions is used for.
4. Understand workflows, events, jobs, runners, steps, and service containers.
5. Add `.github/workflows/ci.yml`.
6. Run backend unit tests in GitHub Actions.
7. Run backend integration tests in GitHub Actions using a temporary PostgreSQL service container.
8. Run Prisma migrations before integration tests.
9. Run frontend tests in GitHub Actions.
10. Run the frontend production build in GitHub Actions.
11. Explain why CI and deployment workflows should be separate.
12. Create safe placeholder deployment workflows for Hostinger.
13. Document required GitHub secret names without exposing real values.
14. Push a branch and inspect GitHub Actions results.

---

## End-of-Day Deliverable

Students should complete:

```text
.github/
  workflows/
    ci.yml
    deploy-backend-hostinger.yml
    deploy-frontend-hostinger.yml
```

The CI workflow should:

- Run on pull requests.
- Run on pushes to `main`.
- Install backend dependencies.
- Run backend unit tests.
- Start a temporary PostgreSQL service container for backend integration tests.
- Set `DATABASE_URL` for the CI test database.
- Generate Prisma Client.
- Apply Prisma migrations using `prisma migrate deploy`.
- Run backend integration tests.
- Install frontend dependencies.
- Run frontend tests.
- Build the frontend.

The deployment workflow files should:

- Exist as placeholders.
- Use `workflow_dispatch`.
- Not contain real secrets.
- List required GitHub secret names.

The README should include:

- CI summary
- Unit vs integration test explanation
- CI test database explanation
- Deployment workflow summary
- Required secret names
- Warning not to commit secrets

Suggested commit message:

```text
Add GitHub Actions CI with test database setup
```

---

# Morning Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---:|---|
| 0–10 min | Recap Day 16 and testing work |
| 10–20 min | Explain CI and why it matters |
| 20–30 min | Unit tests vs integration tests in CI |
| 30–40 min | Explain GitHub Actions vocabulary and service containers |
| 40–55 min | Trainer demo: create CI workflow with PostgreSQL service |
| 55–60 min | Assign hands-on task and success criteria |

---

## 0–10 Minutes — Recap Day 16 and Testing Work

### Trainer Script

“Yesterday we polished the application and prepared it for production-style configuration.

We made sure frontend API URLs come from environment variables, not hardcoded values. We reviewed `.env.example` files, loading states, error states, empty states, submit disabled states, and production-safe configuration.

Before that, we also wrote tests for backend service behavior, API behavior, and frontend visible behavior.

Today we connect those pieces to GitHub.

The goal is simple:

When code is pushed, GitHub should automatically check whether backend tests pass, frontend tests pass, and the frontend can build successfully.”

### Ask the Students

#### Q1. Why did we add tests earlier in Week 4?

Expected answer:

“To protect important business behavior and frontend behavior from breaking when code changes.”

Trainer follow-up:

“Correct. Today we make those tests run automatically.”

---

#### Q2. Why should the frontend API base URL come from an environment variable?

Expected answer:

“Because local and production URLs can be different. We should not hardcode the backend URL inside frontend pages.”

Trainer follow-up:

“Correct. This also matters during deployment because the production frontend needs to call the production backend.”

---

#### Q3. Should we commit real `.env` files or production credentials?

Expected answer:

“No. Real secrets should not be committed. We should commit `.env.example` only.”

Trainer follow-up:

“Good. Keep that same rule in mind today when we create deployment workflow placeholders.”

---

#### Q4. Can backend integration tests run in CI without a database?

Expected answer:

“No. If the integration tests use Prisma and PostgreSQL, CI must provide a test database.”

Trainer follow-up:

“Exactly. Today we will use a temporary PostgreSQL service container in GitHub Actions.”

---

## 10–20 Minutes — Explain CI and Why It Matters

### Trainer Script

“CI means Continuous Integration.

It means that when a developer pushes code or opens a pull request, automated checks run on GitHub.

In our project, those checks should answer questions like:

- Do backend unit tests still pass?
- Do backend integration tests still pass?
- Do Prisma migrations apply to a clean database?
- Do frontend tests still pass?
- Can the React app still build for production?

This is important because manual testing alone is not enough.

A developer may test one page locally but accidentally break another page. A developer may forget to run tests. A developer may commit code that works on their machine but fails on a clean machine.

GitHub Actions runs the project on a fresh temporary machine. That helps us catch missing files, missing dependencies, broken tests, migration issues, and build errors.”

### Whiteboard Flow

```text
Developer pushes branch
        ↓
Pull request is opened
        ↓
GitHub Actions runs CI
        ↓
Backend unit tests run
        ↓
Backend integration test database starts
        ↓
Prisma migrations run
        ↓
Backend integration tests run
        ↓
Frontend tests run
        ↓
Frontend build runs
        ↓
Reviewer checks code with more confidence
```

### Ask the Students

#### Q1. What does CI mean?

Expected answer:

“Continuous Integration. It means automated checks run when code is pushed or a pull request is opened.”

#### Q2. Why is CI useful?

Expected answer:

“It catches failures automatically and helps protect the main branch.”

#### Q3. Does CI replace code review?

Expected answer:

“No. CI checks whether tests and builds pass. Code review still checks design, readability, correctness, and maintainability.”

---

## 20–30 Minutes — Unit Tests vs Integration Tests in CI

### Trainer Script

“Before writing the workflow, we must separate two types of backend tests.

Unit tests and integration tests should not be treated exactly the same.

A unit test checks one piece of logic in isolation. In our backend, unit tests may mock Prisma. These tests should not need PostgreSQL.

An integration test checks whether multiple pieces work together. For example:

```text
Express route
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

If a test reaches Prisma and PostgreSQL, it needs a database.

So in CI, we have two choices:

1. Skip integration tests.
2. Provide a temporary database and run integration tests properly.

For this training project, the better professional approach is to provide a temporary PostgreSQL database using a GitHub Actions service container.”

### Whiteboard Flow for Integration Tests

```text
GitHub Actions job starts
        ↓
PostgreSQL service container starts
        ↓
DATABASE_URL points to test database
        ↓
Backend dependencies install
        ↓
Prisma Client generated
        ↓
Prisma migrations applied
        ↓
Integration tests run
        ↓
Job ends and database disappears
```

### Trainer Explanation

“The CI test database is not the production database. It is temporary. It exists only for the CI job.

That means it is safe to use simple test credentials like:

```text
postgres / postgres
mini_business_app_test
```

These are not real production credentials.

Never run CI tests against the production database.”

### Ask the Students

#### Q1. Why do unit tests not need PostgreSQL?

Expected answer:

“Because unit tests should isolate the code and can mock dependencies such as Prisma.”

#### Q2. Why do integration tests need PostgreSQL?

Expected answer:

“Because they test the backend with the real database layer through Prisma.”

#### Q3. Should we skip integration tests permanently because they need a database?

Expected answer:

“No. We should provide a temporary PostgreSQL database in CI.”

#### Q4. Why should CI run migrations before integration tests?

Expected answer:

“Because the temporary database starts empty. Migrations create the required tables and schema.”

---

## 30–40 Minutes — GitHub Actions Vocabulary and Service Containers

### Trainer Script

“GitHub Actions uses a few words that we need to understand before writing the workflow.”

### Vocabulary Table

| Term | Meaning |
|---|---|
| Workflow | Automation file inside `.github/workflows/` |
| Event | When the workflow runs, such as PR or push |
| Job | A group of steps, such as backend unit tests |
| Runner | Temporary machine that runs the job |
| Step | One command or action inside a job |
| Service container | Temporary Docker container available to a job |

### Trainer Explanation

“For Day 17, our important new concept is the service container.

A service container is useful when tests need another service, such as PostgreSQL.

The backend integration test job will run on an Ubuntu runner. Beside that runner, GitHub Actions will start a PostgreSQL container.

The backend tests will connect to PostgreSQL using `localhost:5432`.”

### Ask the Students

#### Q1. What is a workflow?

Expected answer:

“A workflow is a GitHub Actions automation file inside `.github/workflows/`.”

#### Q2. What is a job?

Expected answer:

“A job is a group of steps that runs on a runner.”

#### Q3. What is a service container?

Expected answer:

“A temporary Docker container that provides a dependency, such as PostgreSQL, to a CI job.”

---

## 40–55 Minutes — Trainer Demo: Create CI Workflow with PostgreSQL Service

### Step 1 — Confirm Package Scripts

Ask students to open:

```text
backend/package.json
frontend/package.json
```

Backend should have separate test scripts similar to:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test": "npm run test:unit && npm run test:integration",
    "test:watch": "vitest"
  }
}
```

Frontend should have scripts similar to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Trainer Warning

“Do not replace the whole scripts block blindly.

If the project already has `dev`, `build`, `preview`, or `lint`, preserve them.

We are adding CI support, not breaking local development.”

---

### Step 2 — Create Folder and File

From the project root:

```powershell
mkdir .github
mkdir .github\workflows
```

If the folder already exists, students can create the file directly.

Create:

```text
.github/workflows/ci.yml
```

---

### Step 3 — Add Workflow Content

Use this workflow:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  backend-unit-tests:
    name: Backend unit tests
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: backend

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mini_business_app_test?schema=public

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run backend unit tests
        run: npm run test:unit

  backend-integration-tests:
    name: Backend integration tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: mini_business_app_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres -d mini_business_app_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    defaults:
      run:
        working-directory: backend

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mini_business_app_test?schema=public
      JWT_SECRET: ci-test-secret

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Apply Prisma migrations
        run: npx prisma migrate deploy

      - name: Run backend integration tests
        run: npm run test:integration

  frontend-checks:
    name: Frontend tests and build
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: npm ci

      - name: Run frontend tests
        run: npm test

      - name: Build frontend
        run: npm run build
```

### Trainer Notes

- This material assumes the program uses Node.js 24 LTS.
- If your project is fixed to a different Node LTS version, use the same version in CI.
- If `npm ci` fails because lock files are missing, students should not randomly change commands. First confirm whether `package-lock.json` exists and is committed.
- If `npm ci` fails with a lockfile sync error, run `npm install` locally in the same app folder and commit both `package.json` and `package-lock.json` if they changed.
- If the project does not yet have integration tests, either add the script when integration tests are ready or keep only the unit-test job temporarily with a clear TODO. Do not pretend integration tests ran if they did not run.

---

### Explain Important Lines

#### `backend-unit-tests`

“This job runs backend tests that do not need a running PostgreSQL service.”

“The job still sets a safe dummy `DATABASE_URL` because Prisma reads the datasource URL while generating the client.”

#### `backend-integration-tests`

“This job runs backend tests that need PostgreSQL.”

#### `services: postgres`

“This starts a temporary PostgreSQL container for the integration test job.”

#### `image: postgres:16`

“This tells GitHub Actions which PostgreSQL Docker image to use.”

#### `POSTGRES_DB: mini_business_app_test`

“This creates a test database for the CI job.”

#### `DATABASE_URL`

“This tells Prisma where the test database is.”

#### `npx prisma migrate deploy`

“This applies committed migrations to the empty CI test database.”

#### `npm run test:integration`

“This runs tests that require the database.”

#### `frontend-checks`

“This job runs React tests and verifies that the React app can build.”

---

## 55–60 Minutes — Assign Hands-On Task and Success Criteria

### Trainer Script

“Your task is to add CI to the project.

Do not paste secrets.

Do not connect CI tests to a production database.

Use a temporary PostgreSQL service container for integration tests.

If your integration test folder does not exist yet, discuss with me before adding the integration job. The rule is simple: either integration tests run correctly with a database, or they are clearly marked as not yet added. We do not silently skip them and pretend CI is complete.”

### Hands-On Task

Students must:

1. Confirm backend scripts.
2. Separate backend unit and integration test scripts if needed.
3. Confirm frontend test/build scripts.
4. Create `.github/workflows/ci.yml`.
5. Add backend unit test job.
6. Add backend integration test job with PostgreSQL service container if integration tests exist.
7. Add Prisma generate before backend unit and integration tests.
8. Add Prisma migrate deploy before backend integration tests.
9. Add frontend test/build job.
10. Push branch.
11. Open GitHub Actions tab.
12. Inspect results.
13. Fix failures.

### Success Criteria

By the end of the morning hands-on period:

- CI workflow file exists.
- Backend unit test job is configured.
- Backend unit test job runs `npx prisma generate` before unit tests.
- Backend integration test job uses PostgreSQL service container if integration tests exist.
- Backend integration test job runs `npx prisma generate` before migrations and tests.
- Integration job runs migrations before tests.
- Frontend tests and build are configured.
- No secrets are committed.

---

# Afternoon Session — 1 Hour

## Suggested Timing

| Time | Topic |
|---:|---|
| 0–10 min | Student demo: show workflow file |
| 10–25 min | Review GitHub Actions results |
| 25–40 min | Debug failing checks |
| 40–50 min | Review deployment workflow separation and secret safety |
| 50–58 min | Review questions with expected answers |
| 58–60 min | Closing and Day 18 bridge |

---

## 0–10 Minutes — Student Demo

Ask each student or group to show:

- `.github/workflows/ci.yml`
- Backend unit test job
- Backend integration test job
- PostgreSQL service configuration
- Prisma migration step
- Frontend check job
- GitHub Actions result page

### Trainer Checklist During Demo

Check:

- Did they use `working-directory: backend` for backend jobs?
- Did they use `working-directory: frontend` for frontend job?
- Did they run `npm run test:unit` separately?
- Did they run `npm run test:integration` only after PostgreSQL and migrations?
- Did they avoid production secrets?

---

## 10–25 Minutes — Review GitHub Actions Results

### Trainer Script

“Do not only look at the green or red icon.

Open the workflow run.

Open each job.

Read the steps.

A professional developer should know which job failed and why.”

### Ask Students to Identify

- Did the backend unit test job run?
- Did the backend integration test job run?
- Did the PostgreSQL service become healthy?
- Did Prisma migrations apply?
- Did integration tests run after migrations?
- Did frontend tests run?
- Did frontend build run?

---

## 25–40 Minutes — Debug Failing Checks

### Common Failure 1 — `npm ci` fails

Explanation:

“`npm ci` needs a committed `package-lock.json` that matches `package.json`.”

Fix:

Run locally in the correct folder:

```powershell
npm install
```

Then commit the updated `package.json` and `package-lock.json` if either file changed.

If the error says a package is missing from the lock file, for example:

```text
Missing: @emnapi/runtime@1.11.1 from lock file
```

make the dependency explicit if npm requires it, then regenerate and commit the lock:

```powershell
npm install @emnapi/runtime@1.11.1 --save-dev
```

---

### Common Failure 2 — Workflow cannot find `package.json`

Explanation:

“The job is running in the wrong folder.”

Fix:

Check:

```yaml
defaults:
  run:
    working-directory: backend
```

or:

```yaml
defaults:
  run:
    working-directory: frontend
```

---

### Common Failure 3 — Integration test cannot connect to database

Explanation:

“The PostgreSQL service may be missing, unhealthy, or the `DATABASE_URL` may be wrong.”

Fix:

Check these pieces:

```yaml
services:
  postgres:
    image: postgres:16
```

```yaml
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mini_business_app_test?schema=public
```

```yaml
options: >-
  --health-cmd "pg_isready -U postgres -d mini_business_app_test"
```

---

### Common Failure 4 — Integration test says table does not exist

Explanation:

“The database started empty and migrations did not run before the tests.”

Fix:

Make sure this step exists before integration tests:

```yaml
- name: Apply Prisma migrations
  run: npx prisma migrate deploy
```

---

### Common Failure 5 — Prisma Client is missing or outdated

Explanation:

“CI is a fresh machine. It may need Prisma Client generation.”

“If the project uses a custom Prisma output path such as `src/generated/prisma`, tests can fail before any test runs if the generated files are missing.”

Fix:

Add this before backend unit tests, migrations, or integration tests:

```yaml
- name: Generate Prisma Client
  run: npx prisma generate
```

If Prisma config reads `DATABASE_URL`, add a safe test value to the backend job:

```yaml
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mini_business_app_test?schema=public
```

---

### Common Failure 6 — Test depends on local `.env`

Explanation:

“CI does not automatically have your local `.env` file.”

Fix:

For integration tests, define safe CI test values in the workflow environment.

Do not use production secrets for CI test database values.

---

### Common Failure 7 — Frontend build fails because API base URL is missing

Explanation:

“The React build may expect `VITE_API_BASE_URL`.”

Fix:

For CI builds, the trainer may add a safe build-time value later.

Example:

```yaml
env:
  VITE_API_BASE_URL: http://localhost:3000
```

Do not paste production API URLs or secrets directly unless instructed by the trainer.

---

## 40–50 Minutes — Review Deployment Workflow Separation and Secret Safety

### Trainer Script

“Now that CI is working, let us separate CI from deployment.

CI checks whether code is safe.

Deployment moves code to a server.

Those are different responsibilities.

Today, deployment workflows are placeholders only. We are not adding real Hostinger secrets, SSH keys, or production database URLs.”

### Create Placeholder Backend Deployment Workflow

Create:

```text
.github/workflows/deploy-backend-hostinger.yml
```

Suggested placeholder:

```yaml
name: Deploy Backend to Hostinger

on:
  workflow_dispatch:

jobs:
  deploy-backend:
    name: Backend deployment placeholder
    runs-on: ubuntu-latest

    steps:
      - name: Explain backend deployment placeholder
        run: |
          echo "Backend deployment will be configured by the trainer or senior developer."
          echo "Do not commit real SSH keys, passwords, or production database URLs."
          echo "Required secrets may include:"
          echo "HOSTINGER_HOST"
          echo "HOSTINGER_USERNAME"
          echo "HOSTINGER_PORT"
          echo "HOSTINGER_SSH_KEY"
          echo "HOSTINGER_BACKEND_PATH"
          echo "PRODUCTION_DATABASE_URL"
```

### Create Placeholder Frontend Deployment Workflow

Create:

```text
.github/workflows/deploy-frontend-hostinger.yml
```

Suggested placeholder:

```yaml
name: Deploy Frontend to Hostinger

on:
  workflow_dispatch:

jobs:
  deploy-frontend:
    name: Frontend deployment placeholder
    runs-on: ubuntu-latest

    steps:
      - name: Explain frontend deployment placeholder
        run: |
          echo "Frontend deployment will be configured by the trainer or senior developer."
          echo "The React app should be built into frontend/dist before upload."
          echo "Do not commit real FTP, SSH, API, or hosting credentials."
          echo "Required secrets may include:"
          echo "HOSTINGER_HOST"
          echo "HOSTINGER_USERNAME"
          echo "HOSTINGER_PORT"
          echo "HOSTINGER_SSH_KEY"
          echo "HOSTINGER_FRONTEND_PATH"
          echo "PRODUCTION_API_BASE_URL"
```

---

## 50–58 Minutes — Review Questions with Expected Answers

### Q1. What does CI mean?

Expected answer:

“CI means Continuous Integration. It runs automated checks when code is pushed or a pull request is opened.”

---

### Q2. Why do we separate backend unit tests and integration tests?

Expected answer:

“Unit tests do not need a database and should run quickly. Integration tests need PostgreSQL because they test the backend with Prisma and the database.”

---

### Q3. How do we provide PostgreSQL in GitHub Actions?

Expected answer:

“We use a PostgreSQL service container in the integration test job.”

---

### Q4. Why do we run Prisma migrations in CI before integration tests?

Expected answer:

“The CI database starts empty. Migrations create the required tables and schema before tests run.”

---

### Q5. Should CI integration tests use the production database?

Expected answer:

“No. CI tests should use a temporary test database, not production.”

---

### Q6. What is `npm ci` used for?

Expected answer:

“`npm ci` installs dependencies from `package-lock.json` in a predictable way for CI.”

---

### Q7. Why do backend and frontend jobs use different working directories?

Expected answer:

“Because backend and frontend have separate package files and commands.”

---

### Q8. Why run frontend build in CI?

Expected answer:

“To catch production build errors before deployment.”

---

### Q9. Why should deployment workflows be separate from CI?

Expected answer:

“CI checks code safety. Deployment moves code to the server. Keeping them separate is safer and easier to control.”

---

### Q10. Where should real deployment secrets be stored?

Expected answer:

“In GitHub repository secrets, not in committed workflow files or `.env` files.”

---

## 58–60 Minutes — Closing and Day 18 Bridge

### Trainer Script

“Today we moved from local testing to automated checks on GitHub.

The most important professional lesson is that CI should run in a clean environment.

If tests need PostgreSQL, we provide PostgreSQL in CI.

We do not depend on someone’s local database.

We do not run tests against production.

And we do not silently skip important checks.

Tomorrow, we will continue from this foundation and move closer to deployment readiness, Hostinger setup planning, environment safety, and final demo preparation.”

---

# Day 17 Trainer Checklist

Before ending the day, verify:

- [ ] `.github/workflows/ci.yml` exists.
- [ ] CI runs on pull requests.
- [ ] CI runs on pushes to `main`.
- [ ] Backend unit test job exists.
- [ ] Backend unit test job uses `working-directory: backend`.
- [ ] Backend unit test job sets a safe test `DATABASE_URL` if Prisma generate needs it.
- [ ] Backend unit test job runs `npx prisma generate`.
- [ ] Backend unit test job runs `npm run test:unit`.
- [ ] Backend integration test job exists if integration tests exist.
- [ ] Backend integration test job uses PostgreSQL service container.
- [ ] Backend integration test job sets test `DATABASE_URL`.
- [ ] Backend integration test job sets safe test-only `JWT_SECRET`.
- [ ] Backend integration test job runs `npx prisma generate`.
- [ ] Backend integration test job runs `npx prisma migrate deploy`.
- [ ] Backend integration test job runs `npm run test:integration`.
- [ ] Frontend job exists.
- [ ] Frontend job uses `working-directory: frontend`.
- [ ] Frontend tests run.
- [ ] Frontend build runs.
- [ ] Deployment placeholders exist.
- [ ] No real secrets are committed.
- [ ] README documents CI and test database setup.

---

# What Not to Do on Day 17

Do not:

- Commit real `.env` files.
- Paste production database URLs into `ci.yml`.
- Run CI tests against production database.
- Remove integration tests permanently because they need PostgreSQL.
- Pretend integration tests ran when they were skipped.
- Replace existing `dev` scripts by accident.
- Remove `build` or `preview` scripts from the frontend.
- Add real Hostinger SSH keys to workflow files.
- Make deployment run automatically before students understand CI.
- Spend the whole day debugging Hostinger deployment.

---

# If Students Are Struggling

Reduce the scope safely:

1. Make backend unit tests pass in CI first.
2. Make frontend tests and build pass in CI.
3. Add the PostgreSQL integration test job as a guided trainer demo.
4. Keep deployment workflows as placeholders.

But be clear:

```text
Integration tests are not removed permanently.
They require a CI database setup.
```

---

# If Students Are Strong

Optional extensions:

- Add a `test:ci` backend script that runs unit and integration tests in the intended order.
- Add path filters so backend-only changes do not always run frontend checks.
- Add frontend CI environment variable for `VITE_API_BASE_URL` using a safe non-secret value.
- Add a database reset/seed step for integration tests if the test suite requires seed data.
- Add status badge documentation to README.

Example badge placeholder:

```markdown
![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)
```

Replace `OWNER` and `REPO` with the actual GitHub repository owner and name.

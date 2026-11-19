

\# Add Feature Workflow



\## Purpose

A reusable workflow for implementing new features safely in the ExpenseTracker project.



\## Instructions



When the user requests a new feature:



1\. Understand the feature request and restate the goal.

2\. Inspect the existing code before suggesting changes.

3\. Identify the frontend, backend, database, and validation changes required.

4\. Present a short implementation plan.

5\. Wait for the user's approval before editing files.

6\. Implement the feature in small, manageable steps.

7\. Follow the project's AGENTS.md rules.

8\. Add or update relevant unit and integration tests.

9\. Run the appropriate tests and build commands.

10\. Fix errors introduced by the changes.

11\. Summarize modified files, implementation details, and test results.



\## Important Rules



\- Do not rewrite unrelated parts of the application.

\- Do not add dependencies without permission.

\- Do not expose secrets or environment variables.

\- Do not claim tests passed unless they were executed successfully.

\- Ask before making destructive changes.



\## Example



User request:

Add a monthly expense filter to the transaction page.



Expected AI response:

1\. Goal: Allow users to filter transactions by month.

2\. Plan:

&#x20;  - Inspect the existing transaction page and API.

&#x20;  - Check whether date filtering already exists.

&#x20;  - Implement the required changes.

&#x20;  - Add tests for monthly filtering.

&#x20;  - Run tests and build.

3\. Ask the user for approval before implementation.




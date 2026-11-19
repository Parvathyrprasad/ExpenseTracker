

\# Code Review Checklist



\## Purpose

A reusable checklist for reviewing code changes in the ExpenseTracker project.



\## Review Steps



1\. Understand the purpose of the code change.

2\. Inspect the modified files and related functionality.

3\. Check for correctness and potential bugs.

4\. Verify input validation and error handling.

5\. Check authentication and authorization where applicable.

6\. Check database queries and Prisma usage.

7\. Look for exposed secrets or sensitive information.

8\. Check TypeScript types and code consistency.

9\. Review performance and unnecessary duplication.

10\. Check whether relevant tests exist and pass.



\## Review Output



For every review, provide:



\- Summary of the changes.

\- Critical issues that must be fixed.

\- Important improvements.

\- Minor suggestions.

\- Missing test cases.

\- Overall review result.



\## Review Rules



\- Do not modify files automatically during a review.

\- Explain every identified issue clearly.

\- Mention the affected file and relevant code location.

\- Do not report hypothetical issues as confirmed bugs.

\- Never expose passwords, tokens, or environment secrets.



\## Example



Request:

Review the transaction creation functionality.



Expected output:

\- Check whether transaction amounts are validated.

\- Check whether invalid dates are rejected.

\- Verify that the authenticated user can only create transactions for their own account.

\- Check database error handling.

\- Identify missing test cases.

\- Provide a review summary with actionable findings.




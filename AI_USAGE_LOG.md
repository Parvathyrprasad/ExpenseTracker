\# AI Usage Log — ExpenseTracker



\## Entry 1: Project Setup and Architecture



\*\*Prompt:\*\* Help me set up and understand the ExpenseTracker project structure, including its frontend, backend, database, and required commands.



\*\*AI Output:\*\* Explained the React frontend, Express backend, PostgreSQL database, Prisma ORM, and development commands.



\*\*What was wrong or missing:\*\* I needed to understand how the existing folders and components connected, rather than just receive a list of technologies.



\*\*What I changed:\*\* I inspected the project structure and used the existing application instead of creating a new project.



\## Entry 2: Expense Validation



\*\*Prompt:\*\* Help me resolve the validation messages appearing when saving an expense, including the required-field and amount validation errors.



\*\*AI Output:\*\* Helped investigate form validation and the requirement that the expense amount must be greater than or equal to zero.



\*\*What was wrong or missing:\*\* The validation messages were appearing when I attempted to save the form, so I needed to check the entered values and validation behaviour.



\*\*What I changed:\*\* I tested the form again and checked whether the required fields and amount values were accepted.



\## Entry 3: Testing the Application



\*\*Prompt:\*\* Help me run the ExpenseTracker backend and frontend tests and understand the results.



\*\*AI Output:\*\* Guided me through running the root test command and interpreting the Vitest results.



\*\*What was wrong or missing:\*\* I needed to verify both backend and frontend tests instead of assuming the application was working.



\*\*What I changed:\*\* I ran the test suite and verified that 42 backend tests and 9 frontend tests passed.



\## Entry 4: Creating Project Rules and Skills



\*\*Prompt:\*\* Help me prepare AI coding instructions and reusable skills for the ExpenseTracker project.



\*\*AI Output:\*\* Helped prepare AGENTS.md, an add-feature workflow skill, and a code-review checklist skill.



\*\*What was wrong or missing:\*\* The project initially did not contain these AI workflow deliverables.



\*\*What I changed:\*\* I created the rules file and saved both skill files under `.agents/skills/`.



\## Entry 5: Automated Testing Hook



\*\*Prompt:\*\* Help me configure a pre-commit hook that runs the ExpenseTracker tests before allowing a commit.



\*\*AI Output:\*\* Provided a Bash pre-commit script and a Windows-compatible command script to run the tests.



\*\*What was wrong or missing:\*\* Git on Windows initially could not launch the Bash hook automatically.



\*\*What I changed:\*\* I tested the Bash script directly using Git Bash and tested the Windows `.cmd` script from Command Prompt. Both successfully ran the test suites, with 51 tests passing. Automatic Git hook launching still needs verification.



\---



\## Summary



AI assistance helped me understand the project structure, troubleshoot validation, verify tests, and prepare reusable AI development instructions. I reviewed the generated instructions and tested the application rather than accepting AI suggestions without verification.


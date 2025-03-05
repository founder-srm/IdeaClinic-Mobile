---
name: Task Item for members
about: Task to complete is mentioned here
title: "[TODO] your-issue-here"
labels: enhancement, good first issue, help wanted
assignees: greeenboi

---

### Task Overview
[Brief description of what needs to be accomplished]↴

> [!tip]
> **Temp**: Provide a clear, concise description of the task. Include the WHY (purpose/goal), WHAT (specific deliverables), and any important context. Example: "Implement user authentication flow using OAuth2 to allow users to sign in with their Google accounts. This is needed to support the new social login feature requested by stakeholders." 

### Prerequisites
- [ ] Required to have Installed and joined [Doppler](https://dashboard.doppler.com/workplace/55ce728ac58e146cffda/projects/ideaclinic-mobile) teams.
- [ ] Required to have all the recommended extensions installed (vscode)
- [ ] If working with an iphone, you would need an android emulator setup
- [ ] Required to be on a fork and on the branch v1.1.0
- [ ] Request access to ideaclinic supabase project
- [ ] Relevant documentation reviewed

### Files to Modify
```
app/
├─ (forum)/
│  ├─ _layout.tsx
│  ├─ forum.tsx
└─ ...
```

### Do Not Modify
The following files/components should not be changed:
- `app.json`
- `app/_layout.tsx`
- Any configuration files without prior approval

### Implementation Steps
1. [ ] Step 1
   - Sub-task A
   - Sub-task B
2. [ ] Step 2
3. [ ] Step 3

### Testing Requirements Before Merge Commit
- [ ] Run Formatting `bun format`
- [ ] Run Linting `bun lint`
- [ ] Run a successful prebuild `bun prebuild`
- [ ] Verify Package Integrity `bun x expo-doctor`

### Additional Context
Contact @greeenboi  for setup of doppler or supabase or android studio
[Any other relevant information, constraints, or considerations]

### Definition of Done
- [ ] All implementation steps completed
- [ ] Tests passing
- [ ] Ensure that the boards are updated for this task
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Owner reviewed

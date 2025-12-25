/*
File: project-flow-diagram.md
Description: Flow diagram of the BDD Runner + LocatorBrain process
Language: English
*/

# BDD Runner & LocatorBrain Flow

```mermaid
flowchart TD

  A[Feature File: BDD Step (.feature)] -->|Read Step Lines| B[BDD Runner]
  B -->|Parse Step: Action + Logical Name| C[Action Mapper]
  C -->|Determine Action Type: type/click/assert| D[Smart Locator Brain]
  D -->|Check Cache| D1{Locator in Cache?}
  D1 -- Yes --> E[Use Cached Locator]
  D1 -- No --> F[Scan DOM in Browser]
  F --> G[Filter by Action Type]
  G --> H[Semantic Matching: id, name, text, aria-label, placeholder]
  H --> I[Generate Locator Candidates]
  I --> J[Decide Best Locator + Score]
  J --> K[Save to Cache]
  K --> E
  E --> L[WebDriverIO Command Execution]
  L --> M[Step Logging]
  M --> N[Next Step / Test Complete]
  L -->|Optional: Wait for element| F

```

**Explanation:**

- **Feature File (.feature)**: contains BDD steps written in Gherkin syntax.
- **BDD Runner**: reads steps and sends them to Action Mapper.
- **Action Mapper**: determines the type of action (type, click, assert) based on step.
- **Smart Locator Brain**: resolves logical names into locators, considers cache, DOM scan, action filter, semantic matching.
- **WebDriverIO Command Execution**: performs the action in browser (input text, click, assert).
- **Step Logging**: logs locator decisions, scores, alternatives, and step execution status.
- **Next Step / Test Complete**: moves to next step or completes scenario.
- Optional waits ensure elements are ready before action.

*/


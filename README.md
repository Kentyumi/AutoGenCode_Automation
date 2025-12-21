# AI Automation Tool

## Overview
This tool demonstrates an AI-powered automation framework that can:
- Parse BDD test cases (Gherkin syntax) or other structured testcase formats
- Automatically decide element locators using AI (Locator Brain)
- Generate maintainable Page Object and Action Layer code
- Execute tests directly or generate scripts for customer projects
- Allow auto tester to review & approve generated code once

## Folder Structure
- `demo/` : Place your BDD `.feature` files here
- `locator-brain/` : AI module to scan DOM and decide locators
- `pages/` : Page Object layer (auto-generated)
- `actions/` : Business Action layer (auto-generated)
- `bdd/` : Runner and code generator
- `generated-scripts/` : Auto-generated test scripts
- `project-config.ts` : Base URL and project settings
- `locator-registry.json` : Cache AI-decided locators

## How It Works
1. Drop your BDD file into `demo/`.
2. Run the runner: `ts-node bdd/bdd-runner.ts`
3. The tool will:
   - Parse BDD
   - Use Locator Brain to resolve locators
   - Generate Page Object + Action Layer + test scripts in `generated-scripts/`
   - Cache locator decisions in `locator-registry.json`
   - Allow tester to review & approve code once
4. Tester can optionally run the generated script for validation.

## Example

### BDD Feature (login.feature)
```gherkin
Feature: Login

  Scenario: User can login
    Given I open "/login"
    When I type "username_input" with "testuser"
    And I type "password_input" with "123456"
    And I click "login_button"
    Then I should see "home_page"

Generated Page Object + Action Layer (simplified)
// pages/login-page.ts
export class LoginPage extends BasePage {
  async login(username: string, password: string) {
    await this.type('username_input', username);
    await this.type('password_input', password);
    await this.click('login_button');
  }
}

// actions/login-actions.ts
export class LoginActions {
  private loginPage: LoginPage;

  constructor(browser: Browser) {
    this.loginPage = new LoginPage(browser);
  }

  async performLogin(username: string, password: string) {
    await this.loginPage.login(username, password);
  }
}

Generated Script
const loginActions = new LoginActions(browser);
await loginActions.performLogin('testuser', '123456');

Notes

Review locator-registry.json once for AI-chosen locators

Framework is reusable for multiple projects

Supports extending to other testcase formats in future
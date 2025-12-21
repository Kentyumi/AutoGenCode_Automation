# AI Automation Tool

## Overview
This tool demonstrates an **AI-powered automation framework** that can:

- Parse **BDD test cases** (Gherkin syntax) or other structured testcase formats  
- Automatically decide element locators using AI (**Locator Brain**)  
- Generate maintainable **Page Object** and **Action Layer** code  
- Execute tests directly or generate scripts for customer projects  
- Allow auto tester to review & approve generated code once  

---

## Folder Structure

AI-automation/
├─ locator-brain/ # Core tool: smart-element, decision engine, registry
├─ pages/ # BasePage + Page Objects (auto-generated)
├─ actions/ # Action Layer (auto-generated)
├─ demo/ # Demo runner + BDD testcases
│ ├─ config.ts # Base URL + testcase folder
│ ├─ tcs/ # Folder for .feature files
│ └─ bdd-runner.ts # Runner reads BDD + calls Locator Brain
├─ generated-scripts/ # Auto-generated test scripts
├─ tsconfig.json
├─ package.json
└─ README.md


---

## Setup

1. Install dependencies:  
npm install

2. Make sure Chrome or Chromium is installed.

3. Install TypeScript runner:
npm install -D ts-node typescript

## Prepare Testcase

Place your .feature BDD files in demo/nameProject/testcases

Example: demo/nameProject/testcases/login.feature

Feature: Simple Login Demo

Scenario: Fill form and submit
  Given I enter "John" into "firstname"
  Given I enter "Doe" into "lastname"
  When I click "submitbtn"
  Then I should see "Thank you" in "result"

  Configure Base URL

## Update demo/config.ts:

export const BASE_URL = 'https://www.w3schools.com/html/html_forms.asp';
export const TCS_DIR = './demo/projectName/testcases';


For another project, just change BASE_URL and drop .feature files in the same folder.

## Run BDD Runner
npx ts-node demo/bdd-runner.ts


Runner will:

Read all .feature files in TCS_DIR

Navigate to BASE_URL

Call Locator Brain (smart$()) to resolve locators

Execute click, type, getText according to scenario

Log all actions and locator decisions for review

## Locator Brain Review

All locator decisions are logged:

[LocatorBrain Decision] target: "submitbtn", chosen: "#submit-button", alternatives: [...]


Tester reviews log → approves locators → saved in locator-registry.json

Once approved, future runs reuse cached locators automatically

## Add New Project

Copy demo/config.ts and update BASE_URL

Add .feature files into demo/tcs/

Run the same runner:

npx ts-node demo/bdd-runner.ts


Core tool (locator-brain/) remains unchanged

Runner + Locator Brain works for any project automatically

Notes

Locator Brain supports auto-suggestion for id, name, data-testid, text

BasePage wraps common actions: click, type, getText, isDisplayed

Future improvements:

Full BDD parser

Automatic Page Object generation

Multi-browser support

## Example Generated Code
Page Object (pages/login-page.ts)
export class LoginPage extends BasePage {
  async login(username: string, password: string) {
    await this.type('username_input', username);
    await this.type('password_input', password);
    await this.click('login_button');
  }
}

Action Layer (actions/login-actions.ts)
export class LoginActions {
  private loginPage: LoginPage;

  constructor(browser: Browser) {
    this.loginPage = new LoginPage(browser);
  }

  async performLogin(username: string, password: string) {
    await this.loginPage.login(username, password);
  }
}

## Generated Script
const loginActions = new LoginActions(browser);
await loginActions.performLogin('testuser', '123456');

✅ Summary

Drop BDD .feature + set BASE_URL → run demo

Locator Brain suggests locators automatically

Tester reviews/approves → framework ready

Core tool stays reusable across multiple projects
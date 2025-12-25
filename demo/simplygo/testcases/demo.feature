Feature: EVMS Portal - Vendor Login and Product Verification

  As a vendor
  I want to login into EVMS Portal
  So that I can view and verify assigned products

  Background:
    Given I open "https://evms-portal-uat.azurewebsites.net"

  Scenario: Vendor logs in and verifies product information successfully

    # ===== Login page =====
    Then I should see "Vendor Login"
    And I should see "Username"
    And I should see "Password"

    # ===== Enter credentials =====
    When I type "vendorca" into "username_input"
    And I type "V3nd0rL0g1&" into "password_input"

    When I click "login_button"
    When I click "hamburger_button"
    When I click "logout_button"
    And I should see "login_button"

  

Feature: Fill Text Box form and submit

  Scenario: Submit user information successfully
    Given I open "/text-box"
    When I type "John Doe" into "full name"
    And  I type "john@doe.com" into "email"
    When I click "submit"
    Then I should see "John Doe" in "name"
    

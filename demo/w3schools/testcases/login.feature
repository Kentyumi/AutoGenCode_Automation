Feature: W3Schools Form Demo

  Scenario: Fill HTML form and submit
    Given I open "/html/html_forms.asp"
    When I type "firstname_input" with "John"
    And I type "lastname_input" with "Doe"
    When I click "submit_button"
    Then I should see "Thank you"

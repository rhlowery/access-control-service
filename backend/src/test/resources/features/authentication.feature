Feature: Authentication Lifecycle
  As a user
  I want to be able to login, validate my session, and logout
  So that I can securely access the ACS Backend

  Scenario Outline: Perform login, validate, and logout
    Given the ACS Backend is initialized with mock data
    When I login with userId "<user>" and password "<password>"
    Then the response status should be 200
    And the JWT token should be returned in a cookie
    When I call the me endpoint
    Then the response status should be 200
    And the response user should be "<user>"
    When I logout
    Then the response status should be 200
    When I call the me endpoint
    Then the response status should be 401

    Examples:
      | user  | password |
      | alice | password |
      | bob   | password |
      | admin | admin    |

  Scenario Outline: Login with optional role and persona parameters
    Given the ACS Backend is initialized with mock data
    When I login with userId "<user>" and role "<role>" and persona "<persona>"
    Then the response status should be 200
    And the JWT token should be returned in a cookie
    When I call the me endpoint
    Then the response status should be 200
    And the response user should be "<user>"
    And the response persona should be "<expected_persona>"

    Examples:
      | user  | role          | persona | expected_persona |
      | user1 |               |         | NONE             |
      | user2 | STANDARD_USER |         | NONE             |
      | user3 | ADMIN         |         | ADMIN            |
      | user4 |               | AUDITOR | AUDITOR          |


Feature: Security and Permissions
  As a user
  I want to ensure that only authorized users can perform certain actions

  Scenario Outline: Verify endpoint security and permissions
    Given I am authenticated as "<user>" with groups "<groups>"
    And <setup_step>
    When I <action>
    Then the response status should be <status>

    Examples:
      | user  | groups | setup_step                                    | action                                   | status |
      | user1 | users  | there is a pending request for table "p"      | try to approve the request for table "p" | 403    |
      | user2 | users  | I submit a request for catalog "c", table "t" | list all requests                        | 200    |
      | admin | admins | there is a pending request for table "adm"    | logout                                   | 200    |

  Scenario: Login validation
    When I try to login with no userId
    Then the response status should be 400

  Scenario: Verify CORS origin settings in default profile
    Given a configuration property "quarkus.http.cors.origins" is checked
    Then the resolved value should be "*"

  Scenario: Verify CORS origin settings in production profile
    Given a configuration property "%prod.quarkus.http.cors.origins" is checked
    Then the resolved value should not be empty
    And the resolved value should not be "*"

  Scenario: Verify cookie secure flag in production profile
    Given a configuration property "%prod.acs.cookie.secure" is checked
    Then the resolved value should be "true"

  Scenario: Verify JWT token has an expiration claim
    When I login with userId "alice" and password "password"
    Then the JWT token should be returned in a cookie
    And the JWT token should have an expiration claim

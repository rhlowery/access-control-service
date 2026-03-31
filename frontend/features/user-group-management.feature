Feature: User and Group Management
  As an administrator
  I want a specialized view of the users and groups in the system
  So that I can assign personas (Admin, Approver, Requester) to users and groups

  Background:
    Given the user is logged into the ACS UI with "ADMIN" role
    And the backend service is running at "http://localhost:8080"

  Scenario Outline: Viewing users and groups
    Given the user navigates to the "Identity & Access" section
    When the dashboard is opened
    Then it should fetch records from "/api/users" and "/api/groups"
    And the table should show users and groups with their respective personas

    Examples:
      | dummy |
      | 1     |

  Scenario Outline: Assigning a persona to a user
    Given there is a user with ID "<userId>"
    When the administrator assigns the "<persona>" persona to the user
    Then the UI should send a PUT request to "/api/auth/users/<userId>/persona"
    And a confirmation should show "Persona <persona> explicitly assigned to user <userId>"

    Examples:
      | userId | persona   |
      | user-1 | ADMIN     |
      | user-2 | APPROVER  |
      | user-3 | REQUESTER |

  Scenario Outline: Assigning a persona to a group
    Given there is a group with ID "<groupId>"
    When the administrator assigns the "<persona>" persona to the group
    Then the UI should send a PUT request to "/api/auth/groups/<groupId>/persona"
    And a confirmation should show "Persona <persona> explicitly assigned to group <groupId>"

    Examples:
      | groupId | persona   |
      | group-1 | ADMIN     |
      | group-2 | APPROVER  |
      | group-3 | REQUESTER |

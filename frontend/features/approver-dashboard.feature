Feature: Approver Dashboard
  As a data owner (approver)
  I want a specialized dashboard to manage access requests for my catalogs
  So that I can quickly review, approve, or reject access requests in line with data governance policies

  Background:
    Given the user is logged into the ACS UI with "APPROVER" role
    And the backend service is running at "http://localhost:8080"

  Scenario Outline: Listing pending access requests
    Given the user navigates to the "Approver Dashboard"
    When the dashboard loads
    Then it should fetch pending requests from "/api/storage/requests"
    And the dashboard should only display requests for resources where the user is an assigned Approver
    And each request should show <field>

    Examples:
      | field              |
      | Principal ID       |
      | Resource Path      |
      | Permission Type    |
      | Justification      |
      | Submission Time    |

  Scenario Outline: Approving or rejecting access requests
    Given there is a pending request with ID "<requestId>" for resource "<resource>"
    When the user clicks the "<action>" button for the request
    And if the action is "reject", the user provides a "Rejection Reason"
    Then the UI should send a POST request to "/api/storage/requests/<requestId>/<action>"
    And the request status in the dashboard should update to "<status>"
    And a notification should show "Successfully <action>ed access for <resource>"

    Examples:
      | requestId | resource            | action  | status    |
      | req-101   | main.default.users  | approve | APPROVED  |
      | req-102   | sales.raw.orders    | reject  | REJECTED  |

  Scenario Outline: Toggling live-stream for pending requests
    Given the administrator has toggled "<feature>" feature to ON
    When the user toggles the local "<control>" switch to "ON"
    Then the UI should connect to the Server-Sent Events (SSE) endpoint at "<endpoint>"
    And new records should appear in the table in real-time

    Examples:
      | feature   | control      | endpoint                        |
      | Live-Feed | Live Stream  | /api/storage/requests/stream    |

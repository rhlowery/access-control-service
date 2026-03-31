Feature: Reviewer Dashboard
  As an auditor/reviewer
  I want a specialized view of the access lifecycle and audit trails
  So that I can verify compliance and track historical access changes

  Background:
    Given the user is logged into the ACS UI with "AUDITOR" role or "REVIEWER" role
    And the backend service is running at "http://localhost:8080"

  Scenario Outline: Viewing audit logs and event history
    Given the user navigates to the "Reviewer Dashboard"
    When the dashboard is opened to the "<tab>" section
    Then it should fetch records from "<endpoint>"
    And the table should show <fieldCount> columns of historical activity including all users and catalogs
    And labels should indicate "<type>" for each event

    Examples:
      | tab        | endpoint               | fieldCount | type       |
      | Audit Log  | /api/audit/log         | 5          | EVENT_TYPE |
      | Requests   | /api/storage/requests  | 8          | REQ_STATUS |

  Scenario Outline: Toggling live-stream for audit logs
    Given the administrator has toggled "<feature>" feature to ON
    When the user toggles the local "<control>" switch to "ON"
    Then the UI should connect to the Server-Sent Events (SSE) endpoint at "<endpoint>"
    And new events from all activities should append to the log in real-time

    Examples:
      | feature   | control      | endpoint                |
      | Live-Feed | Live Stream  | /api/audit/log/stream   |

  Scenario Outline: Verifying access request processing
    Given there is a recently processed request with ID "<requestId>"
    When the user clicks the "Verify" button for the request
    Then the UI should send a POST request to "/api/storage/requests/<requestId>/verify"
    And a confirmation should show "Request <requestId> verified"

    Examples:
      | requestId |
      | req-101   |
      | req-103   |

  Scenario Outline: Verifying catalog resource state
    Given the Auditor is browsing the "Reviewer Dashboard"
    When the user navigates to catalog "<catalogId>"
    And selects a node at path "<path>"
    Then they should have the option to "Verify Node Integrity"
    And clicking it should call "/api/catalog/<catalogId>/nodes/verify" with path "<path>"

    Examples:
      | catalogId | path          |
      | main      | /             |
      | main      | default       |
      | main      | default/users |

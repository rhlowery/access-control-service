Feature: Real-time Synchronization
  As a user of the ACS UI
  I want the request statuses to update in real-time without refreshing
  So that I always have the most current view of my access requests

  Background:
    Given the backend service is running at "http://localhost:8080"
    And the administrator has toggled "Live-Feed" feature to ON

  Scenario Outline: Instant UI update for request status change
    Given the user is logged in with role "<role>"
    And the user navigates to the "<dashboard>"
    And the "Live Stream" toggle is enabled
    When a request with ID "<requestId>" is updated to status "<newStatus>" via the backend stream
    Then the entry for "<requestId>" in the table should instantaneously reflect status "<newStatus>"
    And the UI should provide a visual cue (e.g., highlighting) for the changed row

    Examples:
      | role     | dashboard          | requestId | newStatus |
      | APPROVER | Approver Dashboard | req-101   | APPROVED  |
      | APPROVER | Approver Dashboard | req-102   | REJECTED  |
      | AUDITOR  | Reviewer Dashboard | req-101   | APPROVED  |
      | AUDITOR  | Reviewer Dashboard | req-103   | VERIFIED  |

  Scenario Outline: Automatic list management for real-time updates
    Given the user "<user>" is viewing the "<dashboard>" in "<tab>" tab
    And the "Live Stream" toggle is enabled
    When a request in the list is <action> by another session
    Then that request should be automatically <result> from the current view if it no longer matches the filter
    And it should appear in the destination view instead

    Examples:
      | user       | dashboard          | tab     | action    | result  |
      | approver-1 | Approver Dashboard | PENDING | APPROVED  | removed |
      | approver-1 | Approver Dashboard | PENDING | REJECTED  | removed |

  Scenario Outline: Stream error recovery
    Given the user has enabled the "Live Stream"
    When the connection to the SSE endpoint "<endpoint>" is interrupted
    Then the UI should attempt to reconnect automatically
    And the "Live Stream" indicator should reflect a "<state>" state until restored

    Examples:
      | endpoint                      | state         |
      | /api/storage/requests/stream  | RECONNECTING  |
      | /api/audit/log/stream         | RECONNECTING  |

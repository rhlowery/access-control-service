Feature: Helm Dependency Synchronization

  Scenario: Verify that Helm chart dependencies are in sync
    Given the Helm chart "src/main/helm"
    When I verify the chart dependencies
    Then the dependencies should be successfully synchronized

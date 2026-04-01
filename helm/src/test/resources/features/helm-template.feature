Feature: Helm Chart Template Verification

  Scenario: Render Helm templates with default values
    Given the Helm chart "src/main/helm"
    When I run "helm template" with default values
    Then the output should contain "acs-backend"
    And the "Deployment" for "acs-backend" should have CPU request "100m"
    And the "Deployment" for "acs-backend" should have Memory request "256Mi"

  Scenario: Verify ingress hostnames
    Given the Helm chart "src/main/helm"
    When I run "helm template" with default values
    Then the "Ingress" for "acs-ui" should have host "acs.localtest.me"
    And the "Ingress" for "acs-backend" should have host "api.localtest.me"

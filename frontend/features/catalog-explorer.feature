Feature: Catalog Tree Explorer
  As a data consumer
  I want to browse Unity Catalog resources in a hierarchical tree view with lazy loading, search, and quick actions
  So that I can efficiently find and manage access to data resources

  Background:
    Given the user is logged into the ACS UI
    And the backend service is running at "http://localhost:8080"

  Scenario: Browsing registered catalogs
    When the user navigates to the "Data Catalog" section
    Then they should see a list of registered catalogs from "/api/catalog/registrations"
    And each catalog should have an expand icon indicating it is not yet loaded

  Scenario Outline: Lazy Loading expansion of nodes
    Given the user is in the "Data Catalog" section
    And the user has Navigate to "<parentNode>"
    When the user clicks the expand icon next to the <type> "<nodeName>"
    Then the UI should fetch only children from "/api/catalog/<catalogId>/nodes" with parent "<path>"
    And the children list should be appended to the "<nodeName>" node in the tree

    Examples:
      | parentNode | type    | nodeName | catalogId | path      |
      | Root       | catalog | main     | main      | /         |
      | main       | schema  | default  | main      | default   |
      | default    | table   | users    | main      | default/users |

  Scenario Outline: Visual cues for permission status
    When the user views the <nodeType> "<nodeName>" in the tree
    Then the node should show a "<icon>" icon representing "<accessState>" access

    Examples:
      | nodeType | nodeName | icon  | accessState |
      | table    | users    | check | SELECT      |
      | schema   | private  | lock  | NONE        |
      | catalog  | restricted | lock | NONE        |

  Scenario Outline: Breadcrumb tracking during navigation
    When the user selects the <type> "<nodeName>" at path "<path>"
    Then the navigation breadcrumb should update to "<expectedBreadcrumb>"

    Examples:
      | type    | nodeName | path      | expectedBreadcrumb         |
      | catalog | main     | main      | Catalog > main             |
      | schema  | default  | main/default | Catalog > main > default |
      | table   | users    | main/default/users | Catalog > main > default > users |

  Scenario Outline: Advanced Access Request Workflow
    Given the user has selected the <type> "<nodeName>" at path "<path>"
    When the user clicks the "Request Access" button in the details panel
    Then the "Request Access" modal should appear
    And the "Principal" input should be pre-filled with the current user's ID
    And the "Resource Path" input should show "<fullPath>"
    And the user selects privileges "<privileges>"
    And the user enters justification "need for audit"
    And the user optionally sets expiration to "<expiry>"
    And clicks "Submit Request"
    Then the request should be sent to "/api/storage/requests" via POST
    And a success message "Access request submitted successfully!" should be displayed
    And the modal should automatically close

    Examples:
      | type    | nodeName | path         | fullPath           | privileges         | expiry           |
      | table   | users    | main/default | main/default/users | SELECT, UPDATE     | 2026-12-31T23:59 |
      | schema  | finance  | main         | main/finance       | SELECT, USE_SCHEMA |                  |
      | catalog | sales    | /            | sales              | USE_CATALOG        |                  |

  Scenario: Searching within the catalog tree
    Given the user is in the "Data Catalog" section
    When the user types "sales" into the catalog search bar
    Then the tree should filter to show only nodes matching "sales"
    And parent nodes of matches should be automatically expanded to reveal the results

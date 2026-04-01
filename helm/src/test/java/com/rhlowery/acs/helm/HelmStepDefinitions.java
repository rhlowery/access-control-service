package com.rhlowery.acs.helm;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.yaml.snakeyaml.Yaml;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class HelmStepDefinitions {

    private String chartPath;
    private List<Map<String, Object>> renderedTemplates;
    private String output;

    @Given("the Helm chart {string}")
    public void the_helm_chart(String path) {
        this.chartPath = path;
        File chartDir = new File(path);
        assertTrue(chartDir.exists(), "Chart directory not found: " + path);
    }

    @When("I run {string} with default values")
    public void i_run_helm_template(String command) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("helm", "template", chartPath);
        pb.redirectErrorStream(true);
        Process p = pb.start();

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        int exitCode = p.waitFor();
        assertEquals(0, exitCode, "Helm command failed with output: " + sb.toString());
        this.output = sb.toString();

        Yaml yaml = new Yaml();
        Iterable<Object> docs = yaml.loadAll(output);
        renderedTemplates = new ArrayList<>();
        for (Object doc : docs) {
            if (doc instanceof Map) {
                renderedTemplates.add((Map<String, Object>) doc);
            }
        }
    }

    @Then("the output should contain {string}")
    public void the_output_should_contain(String expected) {
        assertTrue(output.contains(expected));
    }

    @Then("the {string} for {string} should have CPU request {string}")
    public void verify_cpu_request(String kind, String name, String cpu) {
        Map<String, Object> resource = findResource(kind, name);
        assertNotNull(resource, "Resource not found: " + kind + "/" + name);
        
        Map<String, Object> spec = (Map<String, Object>) resource.get("spec");
        Map<String, Object> template = (Map<String, Object>) spec.get("template");
        Map<String, Object> podSpec = (Map<String, Object>) template.get("spec");
        List<Map<String, Object>> containers = (List<Map<String, Object>>) podSpec.get("containers");
        
        boolean found = false;
        for (Map<String, Object> container : containers) {
            Map<String, Object> resources = (Map<String, Object>) container.get("resources");
            Map<String, Object> requests = (Map<String, Object>) resources.get("requests");
            if (cpu.equals(requests.get("cpu"))) {
                found = true;
                break;
            }
        }
        assertTrue(found, "CPU request " + cpu + " not found for " + name);
    }

    @Then("the {string} for {string} should have Memory request {string}")
    public void verify_memory_request(String kind, String name, String memory) {
        Map<String, Object> resource = findResource(kind, name);
        assertNotNull(resource);
        
        Map<String, Object> spec = (Map<String, Object>) resource.get("spec");
        Map<String, Object> template = (Map<String, Object>) spec.get("template");
        Map<String, Object> podSpec = (Map<String, Object>) template.get("spec");
        List<Map<String, Object>> containers = (List<Map<String, Object>>) podSpec.get("containers");
        
        boolean found = false;
        for (Map<String, Object> container : containers) {
            Map<String, Object> resources = (Map<String, Object>) container.get("resources");
            Map<String, Object> requests = (Map<String, Object>) resources.get("requests");
            if (memory.equals(requests.get("memory"))) {
                found = true;
                break;
            }
        }
        assertTrue(found, "Memory request " + memory + " not found for " + name);
    }

    @Then("the {string} for {string} should have host {string}")
    public void verify_ingress_host(String kind, String name, String host) {
        Map<String, Object> resource = findResource(kind, name);
        assertNotNull(resource);
        
        Map<String, Object> spec = (Map<String, Object>) resource.get("spec");
        List<Map<String, Object>> rules = (List<Map<String, Object>>) spec.get("rules");
        
        boolean found = false;
        for (Map<String, Object> rule : rules) {
            if (host.equals(rule.get("host"))) {
                found = true;
                break;
            }
        }
        assertTrue(found, "Host " + host + " not found for Ingress " + name);
    }

    private Map<String, Object> findResource(String kind, String name) {
        for (Map<String, Object> doc : renderedTemplates) {
            String docKind = (String) doc.get("kind");
            Map<String, Object> metadata = (Map<String, Object>) doc.get("metadata");
            String docName = (String) metadata.get("name");
            
            if (kind.equalsIgnoreCase(docKind) && name.equals(docName)) {
                return doc;
            }
        }
        return null;
    }
}

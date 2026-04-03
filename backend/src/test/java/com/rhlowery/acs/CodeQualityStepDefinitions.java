package com.rhlowery.acs;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class CodeQualityStepDefinitions {

    private int exitCode = -1;
    private StringBuilder output = new StringBuilder();

    @Given("the backend source code is available")
    public void backend_source_code_available() {
        Path backendPath = Paths.get("src/main/java");
        assertTrue(Files.exists(backendPath), "Backend source directory not found");
    }

    @When("I run the compilation with the 'development' profile")
    public void run_compilation_with_development_profile() throws Exception {
        // We use the maven wrapper to run pmd:check which is part of the development profile
        ProcessBuilder builder = new ProcessBuilder("./mvnw", "pmd:check", "-Pdevelopment", "-pl", "backend");
        builder.directory(Paths.get("..").toAbsolutePath().toFile());
        builder.redirectErrorStream(true);
        
        Process process = builder.start();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        exitCode = process.waitFor();
    }

    @Then("the build should fail if there are unused imports or redundant annotations")
    public void build_should_fail_if_violations() {
        if (exitCode != 0) {
            fail("Code quality check failed with exit code " + exitCode + ". Output:\n" + output.toString());
        }
    }
}

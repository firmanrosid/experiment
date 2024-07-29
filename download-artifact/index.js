const fs = require("fs");
const { execSync } = require("child_process");
const core = require("@actions/core");
const github = require("@actions/github");

module.exports = async () => {
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  const runs = await github.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    status: "success",
    per_page: 3, // Fetch more runs to increase the chance of finding the artifact
  });

  if (runs.data.total_count === 0) {
    core.setFailed("No successful runs found");
    return;
  }

  console.log("Runs:", runs);

  let artifactFound = false;

  for (const run of runs.data.workflow_runs) {
    const artifacts = await github.rest.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: run.id,
    });

    const artifact = artifacts.data.artifacts.find(
      (artifact) => artifact.name === process.env.ARTIFACT_NAME
    );

    if (artifact) {
      const response = await github.rest.actions.downloadArtifact({
        owner,
        repo,
        artifact_id: artifact.id,
        archive_format: "zip",
      });

      fs.writeFileSync(
        process.env.ARTIFACT_FILENAME,
        Buffer.from(response.data)
      );

      execSync(
        `unzip -o ${process.env.ARTIFACT_FILENAME}`
      );

      console.log("Artifact downloaded successfully");
      artifactFound = true;
      break;
    }
  }

  if (!artifactFound) {
    core.setFailed("No artifact found with the specified name");
  }
};
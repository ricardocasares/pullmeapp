const app = require("express")();
const log = require("debug")("pma");
const pkg = require("./package.json");
const { json } = require("body-parser");
const hook = require("express-github-webhook");
const {
  GitError,
  DeployError,
  AliasingError,
  DeleteError,
  GitHubError
} = require("./lib/errors");
const {
  postStatus,
  gitClone,
  nowDeploy,
  nowAlias,
  prepareAlias,
  removeFiles
} = require("./lib/commands");

const { GITHUB_SECRET, NOW_ALIAS } = process.env;

const webhook = hook({
  path: "/webhook",
  secret: GITHUB_SECRET
});

app
  .use(json())
  .use(webhook)
  .get("/", status)
  .listen(3000);

webhook.on("pull_request", handlePullRequest);

function status(req, res) {
  const { name, version } = pkg;
  res.json({ service: { name, version } });
}

async function handlePullRequest(name, data) {
  const { number, pull_request } = data;
  const { head, user: { login } } = pull_request;
  const { ref, repo, sha } = head;
  const { full_name, clone_url } = repo;
  const status = postStatus(full_name, sha);

  try {
    await status("pending", "Deploying to ▲ Now");
    await gitClone(clone_url, ref, sha);
    const id_url = await nowDeploy(sha);
    const target_url = await nowAlias(
      id_url,
      prepareAlias(NOW_ALIAS, {
        hash: sha,
        pr: number,
        repo: name,
        author: login
      })
    );
    await removeFiles(sha);
    await status("success", "Deploy successful", target_url);
  } catch (err) {
    switch (err.constructor) {
      case GitError:
      case DeployError:
      case AliasingError:
        log("error", err.message);

        try {
          await status("failure", "Deploy failed");
        } catch (error) {
          log("error", err.message);
        }

        break;

      default:
        log("error", err.message);
    }
  }
}

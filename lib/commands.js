const gh = require("gh-got");
const log = require("debug")("pma");
const url = require("url-parse-lax");
const spawn = require("execa");
const {
  DeployError,
  AliasingError,
  GitError,
  DeleteError
} = require("./errors");
const { NOW_TOKEN, NOW_ALIAS } = process.env;

function postStatus(repo, sha) {
  return async function(state, description, target_url, context = "pullmeapp") {
    try {
      log("github:status", state, description);

      const res = await gh.post(`repos/${repo}/statuses/${sha}`, {
        body: {
          state,
          context,
          target_url,
          description
        }
      });

      log("github:status", res.statusCode);
    } catch (e) {
      throw new GitHubError(
        "Cannot create Pull Request status, check your GITHUB_TOKEN."
      );
    }
  };
}

async function gitClone(url, branch, dest) {
  try {
    const args = ["clone", "--depth", 1, url, "-b", branch, dest];

    log("git:clone", url, branch);
    await spawn("git", args);
    log("git:clone", "ok");
  } catch (e) {
    throw new GitError(`Cannot clone git repository: ${e.message}`);
  }
}

async function now(args = [], cwd = __dirname) {
  try {
    // push token to args
    args = args.concat(["--token", NOW_TOKEN]);
    const { stdout } = await spawn("now", args, { cwd });
    return stdout;
  } catch (e) {
    throw new DeployError(e.message);
  }
}

async function nowDeploy(cwd) {
  try {
    log("now:deploy", `deploying`);
    const url = await now([], cwd);
    log("now:deploy", `success ${url}`);
    return url;
  } catch (e) {
    throw new DeployError(`Error while deploying to ▲ Now: ${e.message}`);
  }
}

async function nowAlias(id, alias) {
  if (!NOW_ALIAS) return Promise.resolve(id);
  try {
    log("now:alias", alias);
    await now(["alias", "set", id, alias]);
    log("now:alias", "ok");
    return url(alias).href;
  } catch (e) {
    throw new AliasingError(`Error while running ▲ Now alias: ${e.message}`);
  }
}

async function removeFiles(dir) {
  try {
    log("clean", dir);
    await spawn("rm", ["-rf", dir]);
    log("clean", "ok");
  } catch (e) {
    throw new DeleteError(`Error occured while trying to delete folder ${dir}`);
  }
}

function prepareAlias(alias, { repo, pr, author, hash }) {
  return alias
    .replace("{pr}", pr)
    .replace("{author}", author)
    .replace("{repo}", repo)
    .replace("{hash}", hash.substring(0, 7));
}

module.exports = {
  gitClone,
  nowDeploy,
  nowAlias,
  postStatus,
  prepareAlias,
  removeFiles
};

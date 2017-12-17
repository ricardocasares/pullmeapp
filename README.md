# pullmeapp

Deploy your pull requests instantly to ▲ Now

## Features

### Instant deploy

Deploy every pull request in your repository and get an unique URL on every commit.

### Custom aliases

You are able to customize every pull request alias, `pullmeapp` provides some useful variables you can combine to shape your URL. For example, I'm personally using the following pattern `https://pr-{pr}.{repo}.analogic.al`

## Getting started

### Requirements

You will need to prepare the following

1. Now token
2. GitHub token with repo access
3. Set up a GitHub webhook with a secret

To get your Now token, head to your account settings and then to the Tokens section, create a new token and write it down somewhere.

To create a GitHub token, go to your account settings, click `Developer settings` and then choose `Personal access tokens`, create a new token and write down.

### Deployment

In your terminal run the following now command:

`now ricardocasares/pullmeapp --docker`

▲ Now will ask for all the required environmental variables, these are the following:

`DEBUG`

This is useful to setup the debug level, if you want to see only `pullmeapp` logs, set it to `pma`. If you want to see all the logs (including express app logs) set it to `*`

`GITHUB_TOKEN`

GitHub personal access token

`GITHUB_SECRET`

This keyphrase needs to be setup both on the GitHub webhook and `pullmeapp`, make sure they match.

`NOW_TOKEN`

Now access token

`NOW_ALIAS`

This can be empty, a custom domain, or a domain template. In case you want to use templates, the following strings inside `NOW_ALIAS` are replaced by these values:

* `{pr}` is the GitHub pull request number.
* `{author}` is the PR author.
* `{hash}` is the commit short hash.
* `{repo}` is the repository name.

Make sure you **always include the domain name**, not just the subdomain, even when using `now.sh` urls, see some valid examples:

* `domain.com` will always alias all PR's to this domain.
* `pr-{pr}-{repo}.domain.com` will be replaced, for example, as `pr-41-project.domain.com`
* `{pr}-{repo}.now.sh` will use default now.sh domain.

### Setup the webhook

Once you have deployed and optionally aliased your `pullmeapp` instance, go to your repository settings in GitHub, head to the `Webhooks` section and create a new webhook.

Set the `Payload URL` to match your deployment URL: `https://pullmeapp.domain.com/webhook`

Select `application/json` for the `Content type`.

Use your `GITHUB_SECRET` as your secret, and make sure it is the same you configured in the last step.

Select `Let me select individual events` and check the `Pull request` checkbox.

Create a new pull request and check everything is fine.

Happy staging!

## Contributing

Pull requests and issues are very welcome.

### Development

To improve the development workflow, make sure you add a `.env` file with all your environment variables so you can use `npm run dev` to get the service started.

Once you have the service up and running, you can use `localtunnel` to make your service visible from outside, run `npm install -g localtunnel` and then tunnel your server like this: `lt --port 3000`, you will get an URL like the following `https://zoweubcixc.localtunnel.me` and you can use this as your webhook for development.

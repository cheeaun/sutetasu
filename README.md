Sutetasu
========

Status app for Heroku hosted apps. Uses the [Heroku API](https://api-docs.heroku.com/) to check the state of the process(es) and show logs. Very minimalistic UI and mobile-friendly.

Set up
------

- `git clone` this repo.
- `cd` to repo directory and `npm install`.
- set up `config.json` with example file `config.json.example` OR set environment variables with these variables:
  - `appName` - the app name (hosted on Heroku)
  - `apiKey` - the API key
- `node server.js`

License
-------

[MIT licensed](http://cheeaun.mit-license.org/).

var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')
  , templatePath = path.normalize(__dirname + '/../app/mailer/templates')
  , notifier = {
      service: 'postmark',
      APN: false,
      email: false, // true
      actions: ['comment'],
      tplPath: templatePath,
      key: 'POSTMARK_KEY',
      parseAppId: 'PARSE_APP_ID',
      parseApiKey: 'PARSE_MASTER_KEY'
    }

module.exports = {
  development: {
    db: 'mongodb://localhost/elanceNodeTrackDash',
    root: rootPath,
    notifier: notifier,
    app: {
      name: 'App'
    }
  },
  test: {
    db: 'mongodb://localhost/elanceNodeTrackDashTest',
    root: rootPath,
    notifier: notifier,
    app: {
      name: 'SiteTrackerTest'
    }
  },
  production: {
    db: process.env.MONGOHQ,
    root: rootPath,
    notifier: notifier,
    app: {
      name: 'App'
    }
  }
}

LoginLinks._expireTokens = function() {
  const now = new Date()
  // accessTokens now store expiresAt when created so we can directly identify
  // just those users whose tokens have expired
  const query = { 'services.accessTokens.tokens.expiresAt': { $lte: now } }
  // The old way, triggers mongodb perf alarms even when we add an index on
  // 'services.accessTokens.tokens'
  // const query = {
  //   'services.accessTokens.tokens': {
  //     $exists: true,
  //     $ne: []
  //   }
  // }
  Meteor.users.find(query).forEach(function(user) {
    for (const token of user.services.accessTokens.tokens) {
      const accessToken = new LoginLinks.AccessToken(token)
      if (accessToken.isExpired) {
        Meteor.users.update(user._id, {
          $pull: {
            'services.accessTokens.tokens': {
              hashedToken: token.hashedToken
            }
          }
        })
      }
    }
  })
}
  

Meteor.setInterval(function() {
  LoginLinks._expireTokens()
}, 60 * 60 * 1000) // execute every 1 hours

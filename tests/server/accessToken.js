const yearInMS = 1000 * 60 * 60 * 24 * 365
const now = Date.now()
const when = new Date(now - yearInMS)
// console.log({ yearInMS, now, nowDate: new Date(now), when })

Tinytest.add(
  'login-links - setDefaultExpirationInSeconds',
  function (test) {
    let expiration = 10
    LoginLinks.setDefaultExpirationInSeconds(expiration)
    token = new LoginLinks.AccessToken({hashedToken: 'a', when })
    test.equal(token.getExpirationInSeconds(), expiration)
  }
)

Tinytest.add(
  'login-links - types work',
  function (test) {
    let month = 30 * 24 * 60 * 60
    LoginLinks.setTypes({
      short: {expirationInSeconds: 10 * 60},
      long: {expirationInSeconds: month}
    });
    token = new LoginLinks.AccessToken({hashedToken: 'a', when, type: 'long'})
    test.equal(token.getExpirationInSeconds(), month)
  }
)

Tinytest.add(
  'login-links - per-token expiration is retrieved correctly',
  function (test) {
    let month = 30 * 24 * 60 * 60
    token = new LoginLinks.AccessToken({hashedToken: 'a', when, expirationInSeconds: month})
    test.equal(token.getExpirationInSeconds(), month)
    test.isTrue(token.isExpired)
  }
)

Tinytest.addAsync(
  'login-links - old tokens are cleared',
  function (test, done) {
    const email = 'clear-tokens@example.com'
    const query = { 'emails.address': email }
    try {
      Accounts.createUser({email, password: 'a'})
    } catch(e) { }

    const preUser = Meteor.users.findOne(query)
    LoginLinks.generateAccessToken(preUser._id, { expirationInSeconds: 0 })
    Meteor.setTimeout(function () {
      LoginLinks._expireTokens()
      const postUser = Meteor.users.findOne(query)
      // console.log('preUser.services', JSON.stringify(preUser.services, null, '\t'))
      // console.log('postUser.services', JSON.stringify(postUser.services, null, '\t'))
      const beforeCount = 0
      const afterCount = postUser?.services?.accessTokens?.tokens.length || 0
      test.equal(afterCount, beforeCount) // one added, one cleaned up
      done()
    }, 100)
  }
)

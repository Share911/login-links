class AccessToken {

  constructor(token) {
    if (!token.hashedToken) {
      throw new Meteor.Error('login-links error: access token is missing a field')
    }

    if (!token.when) {
      this.when = new Date()
    }

    this.expirationInSeconds = token.expirationInSeconds ?? calculateExpirationInSeconds(token)
    this.expiresAt = calculateExpiresAt(token)

    Object.assign(this, token)
  }

  get typeConfig() {
    let config

    if (this.type)
      config = LoginLinks._accessTokenTypes[this.type]

    return config || {}
  }

  getExpirationInSeconds() {
    return calculateExpirationInSeconds(this)
  }

  // get expiresAt() {
  //   if (this.expiresAt) {
  //     return this.expiresAt
  //   }
  //   const expirationInMilliseconds = this.getExpirationInSeconds() * 1000
  //   return this.when.getTime() + expirationInMilliseconds
  // }

  get isExpired() {
    const now = Date.now()
    const exp = calculateExpiresAt(this)
    const isExp = exp <= now
    // console.log('[isExpired]', isExp, exp, now)
    return isExp
  }

  get expirationReason() {
    let reason = "This access token (type '"
          + this.type
          + "') has a "
          + this.getExpirationInSeconds()
          + '-second expiry, and expired at '
          + calculateExpiresAt(this)
    return reason
  }

}

LoginLinks.AccessToken = AccessToken

function calculateExpiresAt (token) {
  if (token.expiresAt) {
    return token.expiresAt
  }
  const expirationInSeconds = calculateExpirationInSeconds(token)
  const expirationInMilliseconds = expirationInSeconds * 1000
  const tExpiresAt = token.when.getTime() + expirationInMilliseconds
  return new Date(tExpiresAt)
}

function calculateExpirationInSeconds (token) {
  let expiration = token?.expirationInSeconds
  if (typeof expiration === 'undefined' || expiration === null) {
    if (token.type) {
      const config = LoginLinks._accessTokenTypes[token.type]
      expiration = config?.expirationInSeconds
    }
  }
  if (typeof expiration === 'undefined' || expiration === null) {
    expiration = LoginLinks._defaultExpirationInSeconds
  }
  return expiration
}

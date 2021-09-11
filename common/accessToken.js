class AccessToken {

  constructor(token) {
    if (!token.hashedToken || !token.when)
      throw new Meteor.Error('login-links error: access token is missing a field')

    _.extend(this, token)
  }

  get typeConfig() {
    let config

    if (this.type)
      config = LoginLinks._accessTokenTypes[this.type]

    return config || {}
  }

  getExpirationInSeconds() {
    // console.log('getExpirationInSeconds', this.expirationInSeconds, this.type, LoginLinks._accessTokenTypes, this.typeConfig)
    // NOTE: We use the Nullish coalescing operator ?? instead of || on purpose
    // to allow usage of '0' when setting expiration period
    //   const baz = 0 ?? 42;
    //   console.log(baz);
    //   expected output: 0
    return this.expirationInSeconds ??
      this.typeConfig.expirationInSeconds ??
      LoginLinks._defaultExpirationInSeconds
  }

  get expiresAt() {
    let expirationInMilliseconds = this.getExpirationInSeconds() * 1000
    return this.when.getTime() + expirationInMilliseconds
  }

  get isExpired() {
    const now = Date.now()
    const exp = this.expiresAt
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
          + new Date(this.expiresAt)
    return reason
  }

}

LoginLinks.AccessToken = AccessToken

function expiresAt () {
  let expirationInMilliseconds = this.getExpirationInSeconds() * 1000
  return this.when.getTime() + expirationInMilliseconds
}

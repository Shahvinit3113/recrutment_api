export class AuthResult {
  AccessToken: string;
  RefreshToken: string;

  constructor(result: AuthResult) {
    this.AccessToken = result.AccessToken;
    this.RefreshToken = result.RefreshToken;
  }
}

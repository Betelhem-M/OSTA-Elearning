const oauthService = require("../services/oauthService");

function callbackUrl(result) {
  const url = new URL(`${oauthService.FRONTEND_URL}/auth/callback`);
  url.searchParams.set("token", result.token);
  return url.toString();
}

const oauthController = {
  startGoogle(req, res) {
    try {
      res.redirect(oauthService.getAuthorizationUrl("google"));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async googleCallback(req, res) {
    try {
      const result = await oauthService.authenticate("google", req.query.code, req.query.state);
      res.redirect(callbackUrl(result));
    } catch (error) {
      console.error("Google OAuth error:", error);
      const url = new URL(`${oauthService.FRONTEND_URL}/login`);
      url.searchParams.set("oauth_error", error.message || "Google sign-in failed.");
      res.redirect(url.toString());
    }
  },

  startGithub(req, res) {
    try {
      res.redirect(oauthService.getAuthorizationUrl("github"));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async githubCallback(req, res) {
    try {
      const result = await oauthService.authenticate("github", req.query.code, req.query.state);
      res.redirect(callbackUrl(result));
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      const url = new URL(`${oauthService.FRONTEND_URL}/login`);
      url.searchParams.set("oauth_error", error.message || "GitHub sign-in failed.");
      res.redirect(url.toString());
    }
  },
};

module.exports = oauthController;

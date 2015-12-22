# Simple Lib for using OAuth2 and OIDC in Angular

## Installation

```
npm install angular-oidc
```

## Getting Started

The easiest way to get stared is to include the provided bundle:

```
<script src="node_modules/angular-oidc/bundle/oauth.js"></script>
```

## Dependencies
- angular-base64
- sha256
- angular-ui-router (not part of the bundle)
- angular (not part of the bundle)

## License

MIT, see https://opensource.org/licenses/MIT


## Authorization-Server
The provided sample uses a hosted version of IdentityServer3 (https://github.com/IdentityServer/IdentityServer3), but it is aimed to work also with other OAuth2/OIDC-Authorization-Servers. You can **login with any Facebook-Account or with max/geheim**.

## Configuration

Just configure ``oauthService`` and call setup to let it hook into UI-Router. Users that require to log in are redirected to the mentioned ``loginState`` and after logging in and receiving a token, ``onTokenReceived`` is called. There you can grab the requested token.

```
app.constant("config", { 
    apiUrl: "https://steyer-api.azurewebsites.net",
    loginUrl: "https://steyer-identity-server.azurewebsites.net/identity/connect/authorize",
    issuerUri: "https://steyer-identity-server.azurewebsites.net/identity"
});

app.run(function (oauthService, $http, userService, config) {

    oauthService.loginUrl =  config.loginUrl;
    oauthService.redirectUri = location.origin + "/index.html";
    oauthService.clientId = "spa-demo";
    oauthService.scope = "openid profile email voucher";
    oauthService.issuer = config.issuerUri;
    oauthService.oidc = true;
    
    oauthService.setup({
        loginState: 'login',
        onTokenReceived: function(context) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + context.accessToken;
            userService.userName = context.idClaims['given_name'];
        }
    });

});
```

UI-Router-Route that needs a logged-in user can be marked with ``restricted: true``. This is just about user experience and not about security. Security is done by validating the token at server-side.

```
app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(false);

    $urlRouterProvider.otherwise('/home');

    $stateProvider.state('home', {
        url: '/home',
        templateUrl: '/app/demo/home.html',
    }).state('voucher', {
        url: '/voucher',
        templateUrl: '/app/demo/voucher.html',
        controller: 'VoucherCtrl',
        restricted: true
    }).state('login', {
        url: '/login?requestedUrl',
        templateUrl: '/app/demo/login.html',
        controller: 'LoginCtrl'
    }).state('logout', {
        url: '/logout',
        templateUrl: '/app/demo/logout.html',
        controller: 'LogoutCtrl'
    });

});
```

## More Configuration-Options

You can also register the URL of an web-api that creates a random string when called via GET. This is to create a nonce-using preventing some attacks. Otherwise it uses some simple java-script-fallback for this. In addition to this, you could use the ``validationHandler``-callback to validate the received tokens. The next sample uses this to send the token to a service that checks the signature of it. The ``validationHandler`` should return a promise that informs about the validity of the token by it's state.  

```
app.run(function (oauthService, $http, userService, config) {

    oauthService.loginUrl =  config.loginUrl;
    oauthService.redirectUri = location.origin + "/index.html";
    oauthService.clientId = "spa-demo";
    oauthService.scope = "openid profile email voucher";
    oauthService.issuer = config.issuerUri;
    oauthService.oidc = true;
    oauthService.rngUrl = config.rngUrl;
    
    oauthService.setup({
        loginState: 'login',
        onTokenReceived: function(context) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + context.accessToken;
            userService.userName = context.idClaims['given_name'];
        },
        validationHandler: function(context) {
            var params = {token: context.idToken, client_id: oauthService.clientId};
            return $http.get(config.validationUrl, { params: params});
        }
    });

});
```

## Redirect User

To create the redirect-url that points the user to the Authorization-Server, just call ``createLoginUrl``. You can pass an ``optionState`` that denotes the UI-Router state the user should be redirected to after logging in.

```
oauthService.createLoginUrl(optinalState).then(function (url) {
   // do stuff with url
});
```

To directly redirect the user to the Authorization-Server, you can call ``initImplicitFlow``:

```
oauthService.initImplicitFlow(optionalState);
```

There is also an ``oauthLoginButton``-Directive you could use to create a login-button, that redirects the user to the Authorization-Server:

```
<input 
  oauth-login-button
  type="button" 
  value="Login" 
  state="model.requestedUrl" 
  class="btn" />
```  

## Refresh Token

According to the OAuth2-Spec and for security reasons, implicit flow doesn't issue a refresh-token. But if the Authorization Server remembers the current user and his or her constent, for instance by using cookies, it is quite easy to get a new token without user-interaction. Just redirect the user to the authorization server:
```
oauthService.initImplicitFlow(optionalState);
```

To prevent leaving the current single page application, this library can try to get an new token using an hidden iframe. Call ``tryRefresh`` for this purpose. If that works out, the callback ``onTokenReceived`` (see above) is called. In addition to that, this method returns a promise that tells you, whether the refresh succeeded or failed. Please note, that the mentioned callback is called twice: once for the application-instance in the iframe and once for the calling application outside of it. Afterwards the iframe is removed.  

```
$scope.refresh = function () {
    oauthService
        .tryRefresh()
        .then(function () {
            var token = oauthService.getAccessToken();
            $scope.model.message = "Got Token: " + token;
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        })
        .catch(function () {
            $scope.model.message = "Error receiving new token!";
        });
```

To hide the used iframe, you can define a style for it's class ``oauthFrame``:

```
<style>
    .oauthFrame {
        display: none;
    }
</style>    
```
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    'use strict';

    /*
     * Encapsulation of Nick Galbreath's base64.js library for AngularJS
     * Original notice included below
     */

    /*
     * Copyright (c) 2010 Nick Galbreath
     * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
     *
     * Permission is hereby granted, free of charge, to any person
     * obtaining a copy of this software and associated documentation
     * files (the "Software"), to deal in the Software without
     * restriction, including without limitation the rights to use,
     * copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following
     * conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     * OTHER DEALINGS IN THE SOFTWARE.
     */

    /* base64 encode/decode compatible with window.btoa/atob
     *
     * window.atob/btoa is a Firefox extension to convert binary data (the "b")
     * to base64 (ascii, the "a").
     *
     * It is also found in Safari and Chrome.  It is not available in IE.
     *
     * if (!window.btoa) window.btoa = base64.encode
     * if (!window.atob) window.atob = base64.decode
     *
     * The original spec's for atob/btoa are a bit lacking
     * https://developer.mozilla.org/en/DOM/window.atob
     * https://developer.mozilla.org/en/DOM/window.btoa
     *
     * window.btoa and base64.encode takes a string where charCodeAt is [0,255]
     * If any character is not [0,255], then an exception is thrown.
     *
     * window.atob and base64.decode take a base64-encoded string
     * If the input length is not a multiple of 4, or contains invalid characters
     *   then an exception is thrown.
     */

    angular.module('base64', []).constant('$base64', (function() {

        var PADCHAR = '=';

        var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        function getbyte64(s,i) {
            var idx = ALPHA.indexOf(s.charAt(i));
            if (idx == -1) {
                throw "Cannot decode base64";
            }
            return idx;
        }

        function decode(s) {
            // convert to string
            s = "" + s;
            var pads, i, b10;
            var imax = s.length;
            if (imax == 0) {
                return s;
            }

            if (imax % 4 != 0) {
                throw "Cannot decode base64";
            }

            pads = 0;
            if (s.charAt(imax -1) == PADCHAR) {
                pads = 1;
                if (s.charAt(imax -2) == PADCHAR) {
                    pads = 2;
                }
                // either way, we want to ignore this last block
                imax -= 4;
            }

            var x = [];
            for (i = 0; i < imax; i += 4) {
                b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) |
                    (getbyte64(s,i+2) << 6) | getbyte64(s,i+3);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
            }

            switch (pads) {
                case 1:
                    b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) | (getbyte64(s,i+2) << 6);
                    x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
                    break;
                case 2:
                    b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12);
                    x.push(String.fromCharCode(b10 >> 16));
                    break;
            }
            return x.join('');
        }

        function getbyte(s,i) {
            var x = s.charCodeAt(i);
            if (x > 255) {
                throw "INVALID_CHARACTER_ERR: DOM Exception 5";
            }
            return x;
        }

        function encode(s) {
            if (arguments.length != 1) {
                throw "SyntaxError: Not enough arguments";
            }

            var i, b10;
            var x = [];

            // convert to string
            s = "" + s;

            var imax = s.length - s.length % 3;

            if (s.length == 0) {
                return s;
            }
            for (i = 0; i < imax; i += 3) {
                b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
                x.push(ALPHA.charAt(b10 >> 18));
                x.push(ALPHA.charAt((b10 >> 12) & 0x3F));
                x.push(ALPHA.charAt((b10 >> 6) & 0x3f));
                x.push(ALPHA.charAt(b10 & 0x3f));
            }
            switch (s.length - imax) {
                case 1:
                    b10 = getbyte(s,i) << 16;
                    x.push(ALPHA.charAt(b10 >> 18) + ALPHA.charAt((b10 >> 12) & 0x3F) +
                        PADCHAR + PADCHAR);
                    break;
                case 2:
                    b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
                    x.push(ALPHA.charAt(b10 >> 18) + ALPHA.charAt((b10 >> 12) & 0x3F) +
                        ALPHA.charAt((b10 >> 6) & 0x3f) + PADCHAR);
                    break;
            }
            return x.join('');
        }

        return {
            encode: encode,
            decode: decode
        };
    })());

})();

},{}],2:[function(require,module,exports){
!function(globals) {
'use strict'

var convertHex = {
  bytesToHex: function(bytes) {
    /*if (typeof bytes.byteLength != 'undefined') {
      var newBytes = []

      if (typeof bytes.buffer != 'undefined')
        bytes = new DataView(bytes.buffer)
      else
        bytes = new DataView(bytes)

      for (var i = 0; i < bytes.byteLength; ++i) {
        newBytes.push(bytes.getUint8(i))
      }
      bytes = newBytes
    }*/
    return arrBytesToHex(bytes)
  },
  hexToBytes: function(hex) {
    if (hex.length % 2 === 1) throw new Error("hexToBytes can't have a string with an odd number of characters.")
    if (hex.indexOf('0x') === 0) hex = hex.slice(2)
    return hex.match(/../g).map(function(x) { return parseInt(x,16) })
  }
}


// PRIVATE

function arrBytesToHex(bytes) {
  return bytes.map(function(x) { return padLeft(x.toString(16),2) }).join('')
}

function padLeft(orig, len) {
  if (orig.length > len) return orig
  return Array(len - orig.length + 1).join('0') + orig
}


if (typeof module !== 'undefined' && module.exports) { //CommonJS
  module.exports = convertHex
} else {
  globals.convertHex = convertHex
}

}(this);
},{}],3:[function(require,module,exports){
!function(globals) {
'use strict'

var convertString = {
  bytesToString: function(bytes) {
    return bytes.map(function(x){ return String.fromCharCode(x) }).join('')
  },
  stringToBytes: function(str) {
    return str.split('').map(function(x) { return x.charCodeAt(0) })
  }
}

//http://hossa.in/2012/07/20/utf-8-in-javascript.html
convertString.UTF8 = {
   bytesToString: function(bytes) {
    return decodeURIComponent(escape(convertString.bytesToString(bytes)))
  },
  stringToBytes: function(str) {
   return convertString.stringToBytes(unescape(encodeURIComponent(str)))
  }
}

if (typeof module !== 'undefined' && module.exports) { //CommonJS
  module.exports = convertString
} else {
  globals.convertString = convertString
}

}(this);
},{}],4:[function(require,module,exports){
!function(globals) {
'use strict'

var _imports = {}

if (typeof module !== 'undefined' && module.exports) { //CommonJS
  _imports.bytesToHex = require('convert-hex').bytesToHex
  _imports.convertString = require('convert-string')
  module.exports = sha256
} else {
  _imports.bytesToHex = globals.convertHex.bytesToHex
  _imports.convertString = globals.convertString
  globals.sha256 = sha256
}

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/

// Initialization round constants tables
var K = []

// Compute constants
!function () {
  function isPrime(n) {
    var sqrtN = Math.sqrt(n);
    for (var factor = 2; factor <= sqrtN; factor++) {
      if (!(n % factor)) return false
    }

    return true
  }

  function getFractionalBits(n) {
    return ((n - (n | 0)) * 0x100000000) | 0
  }

  var n = 2
  var nPrime = 0
  while (nPrime < 64) {
    if (isPrime(n)) {
      K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3))
      nPrime++
    }

    n++
  }
}()

var bytesToWords = function (bytes) {
  var words = []
  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
    words[b >>> 5] |= bytes[i] << (24 - b % 32)
  }
  return words
}

var wordsToBytes = function (words) {
  var bytes = []
  for (var b = 0; b < words.length * 32; b += 8) {
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF)
  }
  return bytes
}

// Reusable object
var W = []

var processBlock = function (H, M, offset) {
  // Working variables
  var a = H[0], b = H[1], c = H[2], d = H[3]
  var e = H[4], f = H[5], g = H[6], h = H[7]

    // Computation
  for (var i = 0; i < 64; i++) {
    if (i < 16) {
      W[i] = M[offset + i] | 0
    } else {
      var gamma0x = W[i - 15]
      var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                    ((gamma0x << 14) | (gamma0x >>> 18)) ^
                    (gamma0x >>> 3)

      var gamma1x = W[i - 2];
      var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                    ((gamma1x << 13) | (gamma1x >>> 19)) ^
                    (gamma1x >>> 10)

      W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
    }

    var ch  = (e & f) ^ (~e & g);
    var maj = (a & b) ^ (a & c) ^ (b & c);

    var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
    var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

    var t1 = h + sigma1 + ch + K[i] + W[i];
    var t2 = sigma0 + maj;

    h = g;
    g = f;
    f = e;
    e = (d + t1) | 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) | 0;
  }

  // Intermediate hash value
  H[0] = (H[0] + a) | 0;
  H[1] = (H[1] + b) | 0;
  H[2] = (H[2] + c) | 0;
  H[3] = (H[3] + d) | 0;
  H[4] = (H[4] + e) | 0;
  H[5] = (H[5] + f) | 0;
  H[6] = (H[6] + g) | 0;
  H[7] = (H[7] + h) | 0;
}

function sha256(message, options) {;
  if (message.constructor === String) {
    message = _imports.convertString.UTF8.stringToBytes(message);
  }

  var H =[ 0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
           0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19 ];

  var m = bytesToWords(message);
  var l = message.length * 8;

  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;

  for (var i=0 ; i<m.length; i += 16) {
    processBlock(H, m, i);
  }

  var digestbytes = wordsToBytes(H);
  return options && options.asBytes ? digestbytes :
         options && options.asString ? _imports.convertString.bytesToString(digestbytes) :
         _imports.bytesToHex(digestbytes)
}

sha256.x2 = function(message, options) {
  return sha256(sha256(message, { asBytes:true }), options)
}

}(this);

},{"convert-hex":2,"convert-string":3}],5:[function(require,module,exports){
(function () {

    var oauth2 = angular.module("oauth2");

    oauth2.directive("oauthLoginButton", function (oauthService, $log) {
        return {
            scope: {
                state: "="
            },
            link: function (scope, element, attrs) {
                oauthService.createLoginUrl(scope.state).then(function (url) {
                    element.attr("onclick", "location.href='" + url + "'");
                })
                .catch(function (error) {
                    $log.error("oauthLoginButton-directive error");
                    $log.error(error);
                    throw error;
                });
            }
        };
    });

    oauth2.directive("oauthLoginForm", function (oauthService, $location, $timeout) {
        return {
            scope: {
                callback: "&",
                state: "="
            },
            link: function (scope, element, attrs) {

                window.onOAuthCallback = function (requestedUrl) {
                    if (scope.callback) {
                        scope.callback();
                    }

                    if (requestedUrl) {
                        $timeout(function () {
                            $location.url(requestedUrl.substr(1));
                        }, 0);
                    }
                }

                oauthService.createLoginUrl(scope.state).then(function (url) {
                    var html = "<iframe src='" + url + "' height='400' width='400' id='oauthFrame' class='oauthFrame'></iframe>";
                    element.html(html);
                }).catch(function (error) {
                    $log.error("oauthLoginForm-directive error");
                    $log.error(error);
                });
            }
        };
    });

})();
},{}],6:[function(require,module,exports){
(function () { 
    
    angular.module("oauth2", ['base64']);

})();
},{}],7:[function(require,module,exports){
var oauth2 = oauth2 || {};

(function (namespace) {

    function OAuthService($document, $timeout, $q, $location, $http, $log, $state, $rootScope, $base64) {

        var that = this;
        
        this.clientId = "";
        this.redirectUri = "";
        this.loginUrl = "";
        this.scope = "";
        this.rngUrl = "";
        this.oidc = false;

        this.createLoginUrl = function (state) {
            var that = this;

            if (typeof state === "undefined") { state = ""; }

            return this.createAndSaveNonce().then(function (nonce) {

                if (state) {
                    state = nonce + ";" + state;
                }
                else {
                    state = nonce;   
                }

                var response_type = "token";

                if (that.oidc) {
                    response_type = "id_token+token";
                }

                var url = that.loginUrl 
                            + "?response_type="
                            + response_type
                            + "&client_id=" 
                            + encodeURIComponent(that.clientId) 
                            + "&state=" 
                            + encodeURIComponent(state) 
                            + "&redirect_uri=" 
                            + encodeURIComponent(that.redirectUri) 
                            + "&scope=" 
                            + encodeURIComponent(that.scope);
                
                if (that.oidc) {
                    url += "&nonce=" + encodeURIComponent(nonce);
                }
                
                return url;
            });
        };

        this.initImplicitFlow = function (additionalState) {
            this.createLoginUrl(additionalState).then(function (url) {
                location.href = url;
            })
            .catch(function (error) {
                $log.error("Error in initImplicitFlow");
                $log.error(error);
            });
        };
        
        
        this.callEventIfExists = function() {
                
            if (this.options.onTokenReceived) {
                var tokenParams = { 
                    idClaims: that.getIdentityClaims(),
                    idToken: that.getIdToken(),
                    accessToken: that.getAccessToken()
                };
                this.options.onTokenReceived(tokenParams);
            }
        }

        this.tryLogin = function (options) {
            
            options = options || { };
            
            var parts = this.getFragment();

            var accessToken = parts["access_token"];
            var idToken = parts["id_token"];
            var state = parts["state"];
            
            var oidcSuccess = false;
            var oauthSuccess = false;

            if (!accessToken || !state) return false;
            if (this.oidc && !idToken) return false;

            var savedNonce = localStorage.getItem("nonce");

            var stateParts = state.split(';');
            var nonceInState = stateParts[0];
            if (savedNonce === nonceInState) {
                
                localStorage.setItem("access_token", accessToken);

                var expiresIn = parts["expires_in"];

                if (expiresIn) {
                    var expiresInMilliSeconds = parseInt(expiresIn) * 1000;
                    var now = new Date();
                    var expiresAt = now.getTime() + expiresInMilliSeconds;
                    localStorage.setItem("expires_at", expiresAt);
                }
                if (stateParts.length > 1) {
                    this.state = stateParts[1];
                }

                oauthSuccess = true;

            }
            
            if (!oauthSuccess) return false;

            if (!this.oidc && options.onTokenReceived) {
                options.onTokenReceived({ accessToken: accessToken});
            }
            
            if (this.oidc) {
                oidcSuccess = this.processIdToken(idToken, accessToken);
                if (!oidcSuccess) return false;  
            }
            
            var callEventIfExists = function() {
                
                if (options.onTokenReceived) {
                    var tokenParams = { 
                        idClaims: that.getIdentityClaims(),
                        idToken: idToken,
                        accessToken: accessToken
                    };
                    options.onTokenReceived(tokenParams);
                }
            }
            
            if (options.validationHandler) {
                
                var validationParams = {accessToken: accessToken, idToken: idToken};
                
                options
                    .validationHandler(validationParams)
                    .then(function() {
                        callEventIfExists();
                    })
                    .catch(function(reason) {
                        $log.error('Error validating tokens');
                        $log.error(reason);
                    })
            }
            else {
                callEventIfExists();
            }
            
            var win = window;
            if (win.parent && win.parent.onOAuthCallback) {
                win.parent.onOAuthCallback(this.state);
            }            

            return true;
        };
        
        this.processIdToken = function(idToken, accessToken) {
                var tokenParts = idToken.split(".");
                var claimsBase64 = padBase64(tokenParts[1]);
                var claimsJson = $base64.decode(claimsBase64);
                var claims = JSON.parse(claimsJson);
                var savedNonce = localStorage.getItem("nonce");
                
                if (claims.aud !== this.clientId) {
                    $log.warn("Wrong audience: " + claims.aud);
                    return false;
                }

                if (this.issuer && claims.iss !== this.issuer) {
                    $log.warn("Wrong issuer: " + claims.issuer);
                    return false;
                }

                if (claims.nonce !== savedNonce) {
                    $log.warn("Wrong nonce: " + claims.nonce);
                    return false;
                }
                
                if (accessToken && !this.checkAtHash(accessToken, claims)) {
                    $log.warn("Wrong at_hash");
                    return false;
                }
                
                // Das Prüfen des Zertifikates wird der Serverseite überlassen!

                var now = Date.now();
                var issuedAtMSec = claims.iat * 1000;
                var expiresAtMSec = claims.exp * 1000;
                
                var tenMinutesInMsec = 1000 * 60 * 10;

                if (issuedAtMSec - tenMinutesInMsec >= now  || expiresAtMSec + tenMinutesInMsec <= now) {
                    $log.warn("Token has been expired");
                    $log.warn({
                       now: now,
                       issuedAtMSec: issuedAtMSec,
                       expiresAtMSec: expiresAtMSec
                    });
                    return false;
                }

                localStorage.setItem("id_token", idToken);
                localStorage.setItem("id_token_claims_obj", claimsJson);
                localStorage.setItem("id_token_expires_at", expiresAtMSec);
                
                if (this.validationHandler) {
                    this.validationHandler(idToken)
                }
                
                return true;
        }
        
        this.getIdentityClaims = function() {
            var claims = localStorage.getItem("id_token_claims_obj");
            if (!claims) return null;
            return JSON.parse(claims);
        }
        
        this.getIdToken = function() {
            return localStorage.getItem("id_token");
        }
        
        var padBase64 = function (base64data) {
            while (base64data.length % 4 !== 0) {
                base64data += "=";
            }
            return base64data;
        }

        this.tryLoginWithIFrame = function () {
            var that = this;
            var deferred = $q.defer();

            var url = this.createLoginUrl();

            var html = "<iframe src='" + url + "' height='400' width='400' id='oauthFrame' class='oauthFrame'></iframe>";
            var win = window;

            win.onOAuthCallback = function () {
                $timeout(function () {
                    //$document.find("#oauthFrame").remove();
                    removeIFrame();
                }, 0);
                that.callEventIfExists();
                deferred.resolve();
            };
            removeIFrame();
            //$document.find("#oauthFrame").remove();

            var elem = $(html);
            $document.find("body").children().first().append(elem);

            return deferred.promise;
        };
        
        var removeIFrame = function() {
            var iframes = $document.find("iframe");
            var found = false;
            for(var i=0; i<iframes.length; i++) {
                if (iframes[i].id == "oauthFrame") {
                    found = true;
                    break;
                }
            }
            
            if (!found) return;
            
            angular.element(iframes[i]).remove();       
            
        }

        this.tryRefresh = function (timeoutInMsec) {
            var that = this;
            var deferred = $q.defer();
            
            timeoutInMsec = timeoutInMsec || 10000;

            return this.createLoginUrl().then(function (url) {

                var html = "<iframe src='" + url + "' height='400' width='400' id='oauthFrame' class='oauthFrame'></iframe>";

                var win = window;
                var callbackExecuted = false;
                var timeoutReached = false;

                // Wenn nach einer festgelegten Zeitspanne keine Antwort kommt: Timeout
                var timeoutPromise = $timeout(function () {
                    if (!callbackExecuted) {
                        timeoutReached = true;

                        removeIFrame();
                        //$document.find("#oauthFrame").remove();
                        deferred.reject();
                    }
                }, timeoutInMsec);

                win.onOAuthCallback = function () {
                    if (timeoutReached)
                        return;

                    // Timer für Timeout abbrechen
                    $timeout.cancel(timeoutPromise);

                    // Der Aufrufer (= iframe) kann nicht im Zuge des Aufrufes entfernt werden
                    // Deswegen wird das Entfernen mit einer Verzögerung von 0 Sekunden gesheduled
                    $timeout(function () {
                        //$document.find("#oauthFrame").remove();
                        removeIFrame();
                    }, 0);
                    
                    that.callEventIfExists();

                    deferred.resolve();
                };

                removeIFrame();
                //$document.find("#oauthFrame").remove();

                //var elem = $(html);
                //var e2 = angular.element(html);
                var elem = angular.element(html);
                $document.find("body").append(elem);

                return deferred.promise;
            });
        };

        this.getAccessToken = function () {
            return localStorage.getItem("access_token");
        };

        this.getIsLoggedIn = function () {
            if (this.getAccessToken()) {

                var expiresAt = localStorage.getItem("expires_at");
                var now = new Date();
                if (expiresAt && parseInt(expiresAt) < now.getTime()) {
                    return false;
                }

                return true;
            }

            return false;
        };

        this.logOut = function () {
            localStorage.removeItem("access_token");
            localStorage.removeItem("id_token");
            localStorage.removeItem("nonce");
            localStorage.removeItem("expires_at");
            localStorage.removeItem("id_token_claims_obj");
            localStorage.removeItem("id_token_expires_at");
        };

        this.createAndSaveNonce = function () {
            // var state = this.createNonce();

            return this.createNonce().then(function (nonce) {
                localStorage.setItem("nonce", nonce);
                return nonce;
            })

        };

        this.createNonce = function () {
            
            if (this.rngUrl) {
                return $http
                        .get(this.rngUrl)
                        .then(function (result) {
                            return result.data;
                        });
            }
            else {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 40; i++)
                   text += possible.charAt(Math.floor(Math.random() * possible.length));

                return $q.when(text);
                
            }
        };

        this.getFragment = function () {
            if (window.location.hash.indexOf("#") === 0) {
                return this.parseQueryString(window.location.hash.substr(1));
            } else {
                return {};
            }
        };

        this.parseQueryString = function (queryString) {
            var data = {}, pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

            if (queryString === null) {
                return data;
            }

            pairs = queryString.split("&");

            for (var i = 0; i < pairs.length; i++) {
                pair = pairs[i];
                separatorIndex = pair.indexOf("=");

                if (separatorIndex === -1) {
                    escapedKey = pair;
                    escapedValue = null;
                } else {
                    escapedKey = pair.substr(0, separatorIndex);
                    escapedValue = pair.substr(separatorIndex + 1);
                }

                key = decodeURIComponent(escapedKey);
                value = decodeURIComponent(escapedValue);

                if (key.substr(0, 1) === '/')
                    key = key.substr(1);

                data[key] = value;
            }

            return data;
        };
        
        this.checkAtHash = function(accessToken, idClaims) {
            if (!accessToken || !idClaims || !idClaims.at_hash ) return true;
            var sha256 = require("sha256");
            var tokenHash = sha256(accessToken, { asString: true });
            
            var leftMostHalf = tokenHash.substr(0, tokenHash.length/2 );

            var tokenHashBase64 = $base64.encode(leftMostHalf);
            var atHash = tokenHashBase64.replace("+", "-").replace("/", "_").replace(/=/g, ""); 

            return (atHash == idClaims.at_hash);
        }

        
        this.setup = function (options) {
            
             options = options || {};
             options.loginState = options.loginState || "login"; 
             this.options = options;
         
             $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        
                if (toState.restricted && !that.getIsLoggedIn()) {
                    event.preventDefault();
                    var requestedUrl = $state.href(toState, toParams); 
                    
                    $state.transitionTo(options.loginState, { requestedUrl: requestedUrl });
                }

            });

            if (this.tryLogin(options)) {
        
                if (this.state) {  // #/voucher
                    $location.url(this.state.substr(1)); // cut # off
                }
            }
            
        }
        
    }
    

    namespace.OAuthService = OAuthService;

    var isAngularApp = (window.angular != undefined);

    if (isAngularApp) {
        var app = angular.module("oauth2");
        app.service("oauthService", OAuthService);
    }
})(oauth2);
},{"sha256":4}],8:[function(require,module,exports){
require("angular-base64");
require("sha256");
require("./oauth-module");
require("./oauth-service");
require("./oauth-directives");

},{"./oauth-directives":5,"./oauth-module":6,"./oauth-service":7,"angular-base64":1,"sha256":4}]},{},[8]);

http =   require("http")
url =    require("url")
qs =     require("querystring")
github = require("octonode")

auth_url = github.auth.config(
    client_id:     "3ed6804c6a7159eefd96"
    client_secret: "4e3cb5f3fa90d8d3e6ec1e1db4f5749c14b055b4"
).login([ "intermine", "InterMine" ])

http.createServer((req, res) ->
    uri = url.parse(req.url)

    # Redirect to github login.
    if uri.pathname is "/"
        res.writeHead 301,
            "Content-Type": "text/plain"
            Location: auth_url

        res.end "Redirecting to " + auth_url
    
    # Callback url from GitHub login.
    else if uri.pathname is "/auth"
        github.auth.login qs.parse(uri.query).code, (err, token) ->

            console.log github.client()

            # Build client from access token provided.
            #client = github.client token
            #client.get "/user", (err, status, body) ->
            #    console.log body

        res.writeHead 200,
            "Content-Type": "text/plain"

        res.end ""
    
    else
        res.writeHead 200,
            "Content-Type": "text/plain"

        res.end ""
).listen 3000

console.log "Server started on 3000"
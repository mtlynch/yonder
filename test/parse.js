var yonder = require("../")
var should = require("should")

describe("file parsing", function(){

  it("should parse basic routers file", function(done){
    var routes = yonder.parse(__dirname + "/examples/ROUTER")
    routes.should.be.instanceof(Array).and.have.lengthOf(4)
    routes.should.eql([
      [301, "/privacy",         "/privacy-policy"],
      [301, "/terms",           "/terms-of-use"],
      [302, "/blog",            "http://medium.com/surge-sh"],
      [301, "/articles/:slug",  "/:slug"]
    ])
    done()
  })

  it("should expose file read errors", function(){
    should(function(){
      yonder.parse(__dirname + "/examples/ROUTER-non-existing")
    }).throw({ code: "ENOENT" })
  })

  it("should expose invalid redirect codes instead of returning partial routes", function(){
    should(function(){
      yonder.parse(__dirname + "/examples/ROUTER-invalid-status")
    }).throw("Invalid redirect status code: 304. Expected one of: 301, 302, 303, 307, 308")
  })

})

describe("route line parsing", function(){
  var validStatuses = [301, 302, 303, 307, 308]
  var invalidStatuses = [100, 200, 300, 304, 305, 306, 309, 400, 404, 500, 999,
    "abc", "301x", "1301", "0301", "301.0", "3.01e2", "0x12d"]

  validStatuses.forEach(function(status){
    it("should parse " + status + " as a numeric redirect code", function(){
      yonder.line2route("  " + status + "\t/old /new").should.eql([status, "/old", "/new"])
    })
  })

  invalidStatuses.forEach(function(status){
    it("should reject invalid redirect code " + status, function(){
      should(function(){
        yonder.line2route(status + " /old /new")
      }).throw("Invalid redirect status code: " + status +
        ". Expected one of: 301, 302, 303, 307, 308")
    })
  })

  it("should ignore blank lines, comments, and non-route lines", function(){
    var ignoredLines = ["", "   ", "# old paths", "  # 404 /old /new", "# /old /new", "not a route"]
    ignoredLines.forEach(function(line){
      should.not.exist(yonder.line2route(line))
    })
  })

})

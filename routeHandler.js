var EventEmitter = require('events').EventEmitter
var utils = require('./utils')
var unknownUrl = require('./controller/unknownUrl.js')
var uu = new unknownUrl()

class RouteHandler extends EventEmitter {
		
	constructor() {
		super()
	}
  
	handle(app) {
		//var that = this

			
		app.post('/:url', function (req, res) {
			handleUrls(req, res)
		})
		app.get('/', function (req, res) {
			handleUrls(req, res)
		})
		app.get('/:url', function (req, res) {
			handleUrls(req, res)
		})
		
		var handleUrls = function(req, res)
		{
			var url = req.params.url
			var controller = urlHasController(url)
			if(!controller) {
				if(url !== undefined) {
					uu.handle(req, res)
				} else {
					//that.emit('unknownUrl', url)
					res.writeHead(200)
					res.end('Url is: ' + url)
				}
			} else {
				try {
					switch(req.method)
					{
						case 'GET':
							controller.get(req, res)
							break
						case 'POST':
							var body = '';
							req.on('data', function (chunk) {
								body += chunk;
							});
							req.on('end', function () {
								var jsonObj = JSON.parse(body);
								controller.post(req, res, jsonObj)
							})
							break
						case 'PUT':
							controller.put(req, res)
							break
						case 'DELETE':
							controller.delete(req, res)
							break
						default:
							throw 'invalid request method'
					}
				} catch(e) {
					throw404(req, res, e)
				}
			}
		}
		
		var urlHasController = function(url) {
			if(!utils.string.onlyLettersAndDigits(url)) {
				return false
			}
			try {
				// check if module exists in controller folder
				var module = require('./controller/'+url+'.js')
			} catch(e) {
				if(e.toString().includes('Cannot find module'))
					console.log('Can\'t find controller: /' + url)
				else
					console.log(e)
				return false
			}
			return module
		}
		
		var throw404 = function(req, res, e) {
			var url = req.params.url
			console.log("throw 404 error at " + url)
			console.log(e)
			res.writeHead(404)
			res.end()
        }

	
		return app
	}
}

module.exports = RouteHandler

var http = require("http");
var url = require("url");
var fs = require("fs");
var cookie = require("cookie");
var srv = require("./ServerFunctions.js") 

var PrintStr = srv.PrintStr;
var Log = srv.Log;
var Warn = srv.Warn;
var Err = srv.Err;
var Ack = srv.Ack;
var Note = srv.Note;

function ProcessMsg(msg, data, res)
{
	Note("Process " + msg);
	if (msg=="Login")
	{
		success = function()
		{
			res.writeHead(200, { "Content-Type":"Msg" });
			data = [
				[ "Cookie", {name:"Username", value:data.Username, args:{expires:7}} ],
				[ "Cookie", {name:"PassHash", value:data.PassHash, args:{expires:7}} ],
				[ "Redirect", "/user.html" ]
			];
			Log(data);
			res.write(JSON.stringify(data));
			res.end();
			
			Log("Login Success");
		}
		fail = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				[ "Error", "Invalid Username or Password" ]
			];
			res.write(JSON.stringify(data));
			res.end();
			
			Err("Invalid Username or Password");
		}
		srv.Login(data.Username, data.PassHash, success, fail);
		return;
	}
	else if (msg == "NewUser")
	{
		success = function ()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				[ "Cookie", {name:"Username", value:data.Username, args:{expires:7}} ],
				[ "Cookie", {name:"PassHash", value:data.PassHash, args:{expires:7}} ],
				[ "Redirect", "/user.html" ]
			];
			//Log(data);
			res.write(JSON.stringify(data));
			res.end();
			
			Log("Created new user");
		}
		fail = function ()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				[ "Error", "Account already exists" ]
			];
			res.write(JSON.stringify(data));
			res.end();
			
			//Err("Account already exists");
		}
		srv.CreateUser(data.Username, data.PassHash, success, fail);
		return;
	}
	else if (msg == "Logout")
	{		
		res.writeHead(200, { "Content-Type": "Msg" });
		data = [
			["Cookie", { name:"Username", value:data.Username, args:{ expires: -1 } }],
			["Cookie", { name:"PassHash", value:data.PassHash, args:{ expires: -1 } }],
			["Redirect", "/"]
		];
		res.write(JSON.stringify(data));
		res.end();
		return;
	}
	else if (msg == "GetCharacter")
	{
		success = function(result)
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [ ];
			for (i in result) { Log(result[i]); data.push([ "AddCharacter", 
					result[i].Data
				]); }
			res.write(JSON.stringify(data));
			res.end();
		}
		fail = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				[ "NoCharacter", undefined],
			];
			res.write(JSON.stringify(data));
			res.end();
		}
		srv.GetCharacter(data.Username, data.PassHash, data.Game, success, fail);
		return;
	}
	else if (msg == "AddCharacter")
	{
		success = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				["Log", "Added Character"]
			];
			res.write(JSON.stringify(data));
			res.end();
			return;
		}
		fail = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				["Err", "Failed to add Character"]
			];
			res.write(JSON.stringify(data));
			res.end();
			return;
		}
		srv.AddCharacter({Username:data.Username, PassHash:data.PassHash, Game:data.Game, CharacterID:data.CharacterID, Data:data.Data}, success, fail);
	}
	else if (msg == "DeleteCharacter")
	{
		success = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				["Log", "Deleted Character"]
			];
			res.write(JSON.stringify(data));
			res.end();
			return;
		}
		fail = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				["Err", "Failed to delete Character"]
			];
			res.write(JSON.stringify(data));
			res.end();
			return;
		}
		srv.DeleteCharacter({Username:data.Username, PassHash:data.PassHash, Game:data.Game, CharacterID:data.CharacterID}, success, fail);
	}
	else if (msg == "UpdateCharacter")
	{
		success = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				["Log", "Deleted Character"]
			];
			res.write(JSON.stringify(data));
			res.end();
			return;
		}
		fail = function()
		{
			res.writeHead(200, { "Content-Type": "Msg" });
			data = [
				["Err", "Failed to delete Character"]
			];
			res.write(JSON.stringify(data));
			res.end();
			return;
		}
		srv.UpdateCharacter({Username:data.Username, PassHash:data.PassHash, Game:data.Game, CharacterID:data.CharacterID, Data:data.Data}, success, fail);
	}
	else
	{
		Warn("Unhandled Msg [" + msg + "]");
	}
}

function SendFile(filename, res)
{
	fs.readFile(filename, function (err, data)
	{
		if (err)
		{
			res.writeHead(404, { 'Content-Type': 'text/html' });

			console.error("404 Not Found");
			res.write("Error 404: File not Found");
			return res.end();
		}
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write(data);
		res.end();
		return;
	});
}

function OnRequest(req, res)
{
	var path = "." + url.parse(req.url).pathname
	var query = url.parse(req.url, true, true).query
	PrintStr("Path: "); Log(path);
	PrintStr("Query: "); Log(query);
	
	if (path == "./") { path = "./login.html"; }
	
	if (query && query.Msg) 
	{ 
		ProcessMsg(query.Msg, query, res);
	}
	else
	{
		SendFile(path, res);
	}
	
	Log("");
}

http.createServer(OnRequest).listen(8080);


/*
var cookie = require('cookie');
var escapeHtml = require('escape-html');
var http = require('http');
var url = require('url');

function onRequest(req, res)
{
	// Parse the query string
	var query = url.parse(req.url, true, true).query;
	console.log(req.url);

	if (query && query.name)
	{
		// Set a new cookie with the name
		res.setHeader('Set-Cookie', cookie.serialize('name', String(query.name), {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7 // 1 week
		}));

		// Redirect back after setting cookie
		res.statusCode = 302;
		res.setHeader('Location', req.headers.referer || '/');
		res.end();
		return;
	}

	// Parse the cookies on the request
	var cookies = cookie.parse(req.headers.cookie || '');

	// Get the visitor name set in the cookie
	var name = cookies.name;

	res.setHeader('Content-Type', 'text/html; charset=UTF-8');

	if (name)
	{
		res.write('<p>Welcome back, <b>' + escapeHtml(name) + '</b>!</p>');
	} else
	{
		res.write('<p>Hello, new visitor!</p>');
	}

	res.write('<form method="GET">');
	res.write('<input placeholder="enter your name" name="name"> <input type="submit" value="Set Name">');
	res.end('</form>');
}

http.createServer(onRequest).listen(8080);
*/



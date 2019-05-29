
var mysql = require("mysql");

function PrintStr(arg) { process.stdout.write(arg); }
function Log(arg) { console.log(arg); }
function Warn(arg) { PrintStr("\033[1;33m"); console.warn(arg); PrintStr("\033[m"); }
function Err(arg) { PrintStr("\033[1;31m"); console.error(arg); PrintStr("\033[m"); }
function Ack(arg) { PrintStr("\033[1;32m"); console.log(arg); PrintStr("\033[m"); }
function Note(arg) { PrintStr("\033[1;36m"); console.log(arg); PrintStr("\033[m"); }
exports.PrintStr = PrintStr;
exports.Log = Log;
exports.Warn = Warn;
exports.Err = Err;
exports.Ack = Ack;
exports.Note = Note;


var sql = mysql.createConnection({
	//host: "192.168.0.140",
	host: "tenn3.mooo.com",
	user: "dnd",
	password: "arch",
	database: "DnD"
});

/*function Sql(msg, next)
{
	Log(msg);
	sql.query(msg, function(err, result){ next(err,result); }, true);
}*/

function SqlQueue(msgQueue, last, success, fail)
{
	if (sql)
	{
		SqlQueue_Rec(msgQueue, last, success, fail);
	}
	else
	{
		Err("Sql Not Connected");
		if (fail) { fail(); }
	}
};
function SqlQueue_Rec(msgQueue, last, success, fail, lastResult)
{
	next = msgQueue.shift();
	if (next)
	{
		ret = true;
		if (next[0])
		{
			Log(next[0]);
			try
			{
				sql.query(next[0], function(err, result)
				{
					if (err) { Log(err); }
					
					if (next[1]) { ret=next[1](result); } if (ret == null) { ret=true; }
					
					if (ret) { return SqlQueue_Rec(msgQueue, last, success, fail, result); }
					else { Err("Fail Query"); if (fail) { fail(); } return false; }
				});
			}
			catch(err)
			{
				Err("Catch Fail"); if (fail) { fail(); }
			}
		}
		else
		{
			if (next[1]) { ret=next[1](); } if (ret == null) { ret=true; }

			if (ret) { return SqlQueue_Rec(msgQueue, success, fail, lastResult); }
			else { Err("Fail Empty Query"); if (fail) { fail(); } }
		}
	}
	else 
	{ 
		Log("Successful Query"); 
		ret = lastResult;
		if (last) { ret = last(ret); }
		if (success) { success(ret); }
		return;
	}
}

Log("Connecting to Database...");
sql.connect( function(err) {
	if (err) { Err(err); sql=null; throw("\033[1;31mError::\033[m Cannot start server"); return; }
	Ack("Connected to Database");
	
	sql.on('error', function(err) { Note("Error:"); Err(err); } );

	SqlQueue([
		["CREATE DATABASE IF NOT EXISTS DnD;"],
		
		["CREATE TABLE IF NOT EXISTS Users (Username VARCHAR(255), PassHash VARCHAR(255));"],
		["SELECT * FROM Users;", function(result){ Log("Users:"); Log(result); }],
		
		["CREATE TABLE IF NOT EXISTS PlayerData (Username VARCHAR(255), Game VARCHAR(255), CharacterID VARCHAR(255), Data TEXT);"],
		["SELECT * FROM PlayerData;",function(result){ Log("PlayerData:"); Log(result); }],
		
		], function(){ Log("Done"); }, 
		function(){ Ack("Successfully Initialized Database"); }, function(){ Err("Failed to Initialize Database"); }
	);
});

	
/*
Users
Username[VARCHAR]  PassHash[VARCHAR]

PlayerData
Username[VARCHAR]  Game[VARCHAR]  CharacterID[VARCHAR]  Data[TEXT]

*/

exports.Login = function(username, passHash, success, fail)
{
	username = escape(username);
	passHash = escape(passHash);
	SqlQueue([
		["SELECT Username FROM Users WHERE Username='"+username+"';", 
		function(result) { Log(result); if (!result || result.length == 0){return false;} return true; }],
		["SELECT PassHash FROM Users WHERE username='"+username+"';",
		function (result) { Log(result); Log(passHash); if (result && result[0].PassHash && result[0].PassHash==passHash) { return true; } return false; }]
	], undefined, success, fail);
}


exports.CreateUser = function(username, passHash, success, fail)
{
	username=escape(username);
	passHash=escape(passHash);
	SqlQueue([
		["SELECT Username FROM Users WHERE Username='"+username+"';",
		function (result) { if (result && result.length == 0){return true;} return false; }],
		["INSERT INTO Users(Username,PassHash) VALUES ('"+username+"','"+passHash+"');"]
	], undefined, success, fail);
}

exports.Hash = function(str)
{
	var hash = 0, i, chr;
	if (str.length === 0) return hash;
	for (i = 0; i < str.length; i++)
	{
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

exports.GetCharacter = function(username, passHash, game, success, fail)
{
	username=escape(username);
	passHash=escape(passHash);
	//successDat=1;
	SqlQueue([
		["SELECT Username FROM Users WHERE Username='"+username+"' AND PassHash='"+passHash+"';", 
		function(result) { Log(result); if (!result || result.length == 0){return false;} return true; }],
		
		["SELECT CharacterID, Data  FROM PlayerData WHERE Username='"+username+"' AND Game='"+game+"';",
		function(result) { Log(result); if (!result || result.length == 0){return false;} return true; }]
	],
	undefined, success, fail);
	
}

function AddCharacter(args, success, fail)
{
	Username=escape(args.Username);
	PassHash=escape(args.PassHash);
	Game=escape(args.Game);
	CharacterID=args.CharacterID;
	Data=args.Data;
	
	//successDat=1;
	SqlQueue([
		["SELECT Username FROM Users WHERE Username='"+Username+"' AND PassHash='"+PassHash+"';", 
		function(result) { Log(result); if (!result || result.length == 0){return false;} return true; }],
		
		["SELECT * FROM PlayerData WHERE Username='"+Username+"' AND Game='"+Game+"' AND CharacterID='"+CharacterID+"';",
		function(result) { Log(result); if (result && result.length == 0){return true;} return false; }],
		
		["INSERT INTO PlayerData(Username, Game, CharacterID, Data) VALUES ('"+Username+"', '"+Game+"', '"+CharacterID+"', '"+Data+"');", undefined] 
	],
	undefined, success, fail);
}
exports.AddCharacter = AddCharacter;

function DeleteCharacter(args, success, fail)
{
	Username=escape(args.Username);
	PassHash=escape(args.PassHash);
	Game=escape(args.Game);
	CharacterID=args.CharacterID;
	Data = args.Data;
	
	//successDat=1;
	SqlQueue([
		["SELECT Username FROM Users WHERE Username='"+Username+"' AND PassHash='"+PassHash+"';", 
		function(result) { Log(result); if (!result || result.length == 0){return false;} return true; }],
		
		["DELETE FROM PlayerData WHERE Username='"+Username+"' AND Game='"+Game+"' AND CharacterID='"+CharacterID+"';", undefined] 
	],
	undefined, success, fail);
}
exports.DeleteCharacter = DeleteCharacter;

exports.UpdateCharacter = function(args, success, fail)
{
	
	nextStep = function()
	{
		AddCharacter({Username:args.Username, PassHash:args.PassHash, Game:args.Game, CharacterID:args.CharacterID, Data:args.Data}, success, fail);
	}
	DeleteCharacter({Username:args.Username, PassHash:args.PassHash, Game:args.Game, CharacterID:args.CharacterID}, nextStep, nextStep);
}

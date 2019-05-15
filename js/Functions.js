
function PrintStr(arg) { process.stdout.write(arg); }
function Log(arg) { console.log(arg); }
function Warn(arg) { console.warn(arg); }
function Err(arg) { console.error(arg); }

/*
function AddUser(username, password)
{
	
}

function VerifyUser(username, password)
{
}
*/

function Hash(str)
{
	var hash = 0, i=0, chr=0;
	if (str.length === 0) { return hash; }
	for (i = 0; i < str.length; i++)
	{
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}


var xhttp = new XMLHttpRequest();

function MsgSrv(data)
{
	msg="?"
	for (id in data)
	{
		msg+=id+"="+data[id]+"&";
	} 
	xhttp.open("GET", msg, true);
	xhttp.send();
}

function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
 }
 
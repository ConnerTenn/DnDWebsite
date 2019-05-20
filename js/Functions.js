
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

var ProcessMessage;
var OnConnect;
var OnDisconnect;
var Connected=false;
var ConnectedLast=false;

function ReceiveConfirm()
{
	if (!Connected) 
	{
		if (ConnectedLast)
		{
			if (OnDisconnect) { Warn("Disconnected"); OnDisconnect(); } 
		}
	}
	else
	{
		if (!ConnectedLast)
		{
			if (OnConnect) { Log("Connected"); OnConnect(); } 
		}
	}
	ConnectedLast=Connected;
}
function HeartBeat()
{
	MsgSrv({Msg:"HeartBeat"});
}

function MsgSrv(data)
{
	msg="?"
	for (id in data)
	{
		msg+=id+"="+data[id]+"&";
	}
	Log("Send Message:");
	Log(data);
	xhttp.open("GET", msg, true);
	xhttp.send();

	Connected=false;
	setTimeout(ReceiveConfirm, 1000);
}
function ResponseHandler()
{
	if (this.readyState == 4 && this.status == 200)
	{
		Connected=true;
		if (this.getResponseHeader("Content-Type") == "Msg")
		{
			var data = JSON.parse(this.responseText);
			for (i in data)
			{
				Log("Msg: " + data[i][0]);
				ProcessMessage(data[i][0], data[i][1]);
			}
		}
	}
}
xhttp.onreadystatechange = ResponseHandler;

function InitConnection(processMessage, onConnect, onDisconnect, heartbeat=false)
{
	if (!ProcessMessage) { throw "Need Message Handler" }
	ProcessMessage=processMessage;
	OnConnect=onConnect;
	OnDisconnect=onDisconnect;
	if (heartbeat) { setInterval(HeartBeat, 3000); }
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

function Sanitize(str) 
{
	var out = "";
	for (i in str)
	{
		c=str.charCodeAt(i).toString(16);
		out+=(c.length==1 ? '0'+c : c);
	}
	return out;//str.replace(/\%/g, "#"); 
}

function Desanitize(str)
{
	//str = str.replace(/\#/g, "%");
	var out = "";
	for (i=0; i<str.length; i+=2)
	{
		out+=String.fromCharCode(parseInt(str.substring(i,i+2),16));
		
	}
	return out; 
}
 
 function Gaussian(mu, sigma)
 {
	norm=-2;
	while(norm<-1 || norm>1)
	{
		a=0; while(a==0){ a=Math.random(); }
		b=0; while(b==0){ b=Math.random(); }
		norm=Math.sqrt(-2*Math.log(a))*Math.cos(Math.PI*2*b);
	}
	return norm*sigma+mu;
 }
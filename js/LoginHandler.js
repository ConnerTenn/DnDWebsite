
function ProcessMessage(msg, data)
{
	if (msg == "Redirect")
	{
		redirect = data;
		Log("Redirecting to " + redirect + "...");
		window.location.href = redirect;
		//window.location.replace(redirect);
	}
	else if (msg == "Error")
	{
		$(".Msg").text(data);
	}
	else if (msg == "Cookie")
	{
		Cookies.set(data.name, data.value, data.args);
	}
	else
	{
		Warn("Unhandled Msg [" + msg + "]");
	}
}

function ResponseHandler()
{
	Log("Got Response  State:" + this.readyState + "  Status:" + this.status);
	
	if (this.readyState == 4 && this.status == 200)
	{
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

$(".Login").click(Login);
function Login()
{
	console.log("Login");
	
	$(".Msg").text("");
	
	username = $(".Username").val();
	passHash = Hash($(".Password").val());
	
	MsgSrv({ Msg:"Login", "Username":username, "PassHash":passHash });
}

$(".CreateAccount").click(NewUser);
function NewUser()
{	
	console.log("Create New User");
	
	$(".Msg").text("");

	username = $(".Username").val();
	passHash = Hash($(".Password").val());

	MsgSrv({ Msg:"NewUser", "Username":username, "PassHash":passHash });
}




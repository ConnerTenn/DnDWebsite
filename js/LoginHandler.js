
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

InitConnection(ProcessMessage);

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




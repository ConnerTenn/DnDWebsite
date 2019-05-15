


function ProcessMessage(msg, data)
{
	if (msg == "Redirect")
	{
		redirect = data;
		Log("Redirecting to " + redirect + "...");
		window.location.href = redirect;
		//window.location.replace(redirect);
	}
	else if (msg == "Cookie")
	{
		Cookies.set(data.name, data.value, data.args);
	}
	else if (msg=="AddCharacter")
	{
		Log(JSON.parse(data));
		new Character(JSON.parse(data));
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

$(".Logout").click(Login);
function Login()
{
	console.log("Logout");
	
	MsgSrv({Msg:"Logout"});
}

$CharacterContainer = $(".Character_Container");
$TemplateCharacter = $(".Template.Character");
$TemplateItem = $(".Template.Item");
$TemplateStat = $(".Template.Stat");


CharacterStats = {
	"Strength": [50, 50],
	"Dexterity": [50, 50],
	"Intelligence": [50, 50],
	"Observation": [50, 50],
	"Wisdom": [50, 50],
	"Charisma": [50, 50],
	"MagicalPower": [50, 50],
	"MaxHealth": 6,
	"MaxMana": 10
};

ItemStats = {
	"Strength": [50, 50],
	"Weight": [50, 50],
	"Stealth": [50, 50],
};


function AddStats(stats, location)
{
	for (var i in stats)
	{
		var $newElem = $TemplateStat.clone(true);
		$newElem.removeClass("Template");

		$newElem.find(".Stat_ID").text(i);
		$newElem.find(".Stat_Prob").text(stats[i][0]);
		$newElem.find(".Stat_Var").text(stats[i][1]);
		location.append($newElem);
	}
}




class Character
{
	constructor(data)
	{
		this.$Root = $TemplateCharacter.clone(true);
		this.$Root.removeClass("Template");

		this.$StatContainer = this.$Root.find(".Stat_Container");
		this.$ItemContainer = this.$Root.find(".Item_Container");
		
		
		this.$Root.find(".Character_Name").change(this, ResendCharacterData);
		
		AddStats(CharacterStats, this.$StatContainer);
		
		if (data && data.CharacterName) { this.$Root.find(".Character_Name").val(data.CharacterName); }
		
		if (data && data.CharacterID) { this.CharacterID = data.CharacterID; } else { this.CharacterID = makeid(10); }
		
		this.$Root.find(".Character_ID").text(this.CharacterID);

		$CharacterContainer.append(this.$Root);
	}
	
	$(elem)
	{
		return this.$Root.find(elem);
	}
}

function GetCharacterData($root)
{
	data = {};
	data.CharacterID = $root.find(".Character_ID").text();
	data.CharacterName = $root.find(".Character_Name").val();
	return data;
}

function ResendCharacterData(event)
{
	data = GetCharacterData(event.data.$Root);
	username = Cookies.get("Username");
	passHash = Cookies.get("PassHash");
	
	game = "Intro";
	MsgSrv({ Msg:"UpdateCharacter", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":data.CharacterID, Data:JSON.stringify(data) });
}

this.$(".Add.AddItem").click(AddItem);
function AddItem(event)
{
	var $newElem = $TemplateItem.clone(true);
	$newElem.removeClass("Template");
	
	AddStats(ItemStats, $newElem.find(".Item_Stat_Container"));
	
	$(this).siblings(".Item_Container").append($newElem);
}
this.$(".Del.DelItem").click(DelItem);
function DelItem(event)
{
	$(this).closest(".Item").remove();
}

this.$(".Add.Add_Character").click(AddCharacter);
function AddCharacter()
{
	newCharacter = new Character();
	data = GetCharacterData(newCharacter.$Root);
	//$character = newCharacter.$Root;
	
	//id = $character.find("Character_ID").text();
	username = Cookies.get("Username");
	passHash = Cookies.get("PassHash");
	game = "Intro";
	MsgSrv({ Msg:"AddCharacter", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":data.CharacterID, Data:JSON.stringify(data) });
}
this.$(".Del.Del_Character").click(DelCharacter);
function DelCharacter(event)
{
	$character = $(this).closest(".Character")
	data = GetCharacterData($character);
	
	//id = $character.find("Character_ID").text();
	username = Cookies.get("Username");
	passHash = Cookies.get("PassHash");
	game = "Intro";
	MsgSrv({ Msg:"DeleteCharacter", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":data.CharacterID });
	
	$character.remove();
}
/*function UpdateCharacter()
{
	newCharacter = new Character();
	$character = newCharacter.$Root;
	
	id = $character.find("Character_ID").text();
	username = Cookies.get("Username");
	passHash = Cookies.get("PassHash");
	game = "Intro";
	Log(id);
	MsgSrv({ Msg:"UpdateCharacter", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":id });
}*/
//new Character();

function RequestCharacter(game)
{
	username = Cookies.get("Username");
	passHash = Cookies.get("PassHash");
	MsgSrv({ Msg:"GetCharacter", "Username":username, "PassHash":passHash, "Game":game });
}

function RequestCharacterData(game, name)
{
	username=Cookies.get("Username");
	passHash=Cookies.get("PassHash");
	MsgSrv({Msg:"GetCharacterData", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":name});
}

RequestCharacter("Intro");




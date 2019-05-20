
$(".User").text("User "+Cookies.get("Username"));

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
		Log("Received Character Data:");
		Log(JSON.parse(data));
		new Character(JSON.parse(data));
	}
	else if (msg=="HeartBeat")
	{
		Beat=true;
	}
	else
	{
		Warn("Unhandled Msg [" + msg + "]");
	}
}

function OnConnect()
{
	AddLog("Connected to server!", "green");
}

function OnDisconnect()
{
	AddLog("Warning:: Connection to Server Lost", "red");
}
InitConnection(ProcessMessage, OnConnect, OnDisconnect, true);

$(".Logout").click(Login);
function Login()
{
	Log("Logout");
	
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
	"MaxHealth": [6,0],
	"MaxMana": [10,0]
};

ItemStats = {
	"Strength": [50, 50],
	"Weight": [50, 50],
	"Stealth": [50, 50],
};

GeneralRoll = { "GeneralRoll":[50, 50] };

function AddStats(stats, defaultStats, $location)
{
	for (var i in defaultStats)
	{
		var $newElem = $TemplateStat.clone(true);
		$newElem.removeClass("Template");
		
		stat = ( stats && stats[i] ? stats[i] : defaultStats[i] );
		//Log(stat);
		
		$newElem.find(".Stat_ID").text(i);
		$newElem.find(".Stat_Prob").val(stat[0]);
		$newElem.find(".Stat_Var").val(stat[1]);
		//$newElem.change(ResendCharacterData);
		$location.append($newElem);
	}
}
AddStats(GeneralRoll, GeneralRoll, $(".Log_Column .Stat_Container"));


function InitItem($container, data)
{
	var $newElem = $TemplateItem.clone(true);
	$newElem.removeClass("Template");
	
	itemID=null;
	if (data) 
	{ 
		itemID = data.ItemID; 
		$newElem.find(".Item_Name").val(data.ItemName);
	}
	else { itemID=makeid(10); }
	
	$newElem.find(".Item_ID").text(itemID);
	var stats = ((data && data.Stats) ? data.Stats : null );
	AddStats(stats, ItemStats, $newElem.find(".Item_Stat_Container"));
	
	$container.append($newElem);
}

class Character
{
	constructor(data)
	{
		this.$Root = $TemplateCharacter.clone(true);
		this.$Root.removeClass("Template");

		this.$StatContainer = this.$Root.find(".Stat_Container");
		this.$ItemContainer = this.$Root.find(".Item_Container");
		
		
		//this.$Root.find(".Character_Name").change(this, $ResendCharacterData);
		
		//AddStats(CharacterStats, this.$StatContainer);
		
		if (data)
		{
			if (data.CharacterID) { this.CharacterID = data.CharacterID; } 
			if (data.CharacterName) { this.$Root.find(".Character_Name").val(data.CharacterName); }
			
			for (var i in data.Items)
			{
				InitItem(this.$ItemContainer, data.Items[i]);
			}
			
			if (data.TextBox) { this.$Root.find("textarea").val(Desanitize(data.TextBox)); }
		}
		else { this.CharacterID = makeid(10); }
		
		var stats = ((data && data.Stats) ? data.Stats : null );
		AddStats(stats, CharacterStats, this.$StatContainer);
		
		this.$Root.change(this, function(event) { ResendCharacterData(event.data.$Root) } );
			
		this.$Root.find(".Character_ID").text(this.CharacterID);

		$CharacterContainer.append(this.$Root);
	}
	
	$(elem)
	{
		return this.$Root.find(elem);
	}
}

function GetItemData($item)
{
	var itemData = {};
	itemData.ItemID = $item.find(".Item_ID").text();
	itemData.ItemName = $item.find(".Item_Name").val();
	
	itemData.Stats = {};
	$item.find(".Stat").each( function(i)
	{
		label = $(this).find(".Stat_ID").text();
		itemData.Stats[label] = [$(this).find(".Stat_Prob").val(), $(this).find(".Stat_Var").val()];
	});

	
	return itemData;
}

function GetCharacterData($root)
{
	var data = {};
	data.CharacterID = $root.find(".Character_ID").text();
	data.CharacterName = $root.find(".Character_Name").val();
	data.Stats = {};
	//for (var i in stats)
	$root.find(".Stat_Container .Stat").each( function(i)
	{
		label = $(this).find(".Stat_ID").text();
		data.Stats[label] = [$(this).find(".Stat_Prob").val(), $(this).find(".Stat_Var").val()];
	});
	
	data.Items = [];
	$root.find(".Item").each( function(i)
	{
		data.Items.push(GetItemData($(this)));
	});
	
	//data.TextBox = encodeURIComponent($root.find("textarea").val());
	data.TextBox = Sanitize($root.find("textarea").val());
	Log(data.TextBox);
	
	return data;
}

function ResendCharacterData($character)
{
	var data = GetCharacterData($character);
	username = Cookies.get("Username");
	passHash = Cookies.get("PassHash");
	
	Log("Sending Character Data:");
	Log(data);
	
	game = "Intro";
	MsgSrv({ Msg:"UpdateCharacter", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":data.CharacterID, Data:JSON.stringify(data) });
}


$(".Add.Add_Item").click(AddItem);
$(".Del.Del_Item").click(DelItem);
function AddItem(event)
{
	//Log("Add Item");
	//var $newElem = $TemplateItem.clone(true);
	//$newElem.removeClass("Template");
	InitItem($(this).siblings(".Item_Container"), null);
	
	//AddStats(ItemStats, ItemStats, $newElem.find(".Item_Stat_Container"));
	
	//$(this).siblings(".Item_Container").append($newElem);
	
	ResendCharacterData($(this).closest(".Character"));
}
function DelItem(event)
{
	$character = $(this).closest(".Character")
	
	$(this).closest(".Item").remove();
	
	ResendCharacterData($character);
}

$(".Add.Add_Character").click(AddCharacter);
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

$(".Del.Del_Character").click(DelCharacter);
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

$Log=$(".Log");
function AddLog(str, colour="black")
{
	temp = "<div style='color:"+colour+";'>" + str + "</div>"
	$Log.append(temp);
	
	$children = $Log.children();
	if ($children.length > 100)
	{
		$($children[0]).remove();
	}

	$Log.scrollTop($Log.height());
}

$(".Roll").click(Roll);
function Roll(event)
{
	$Stat = $(this).closest(".Stat");
	average = parseInt($Stat.find(".Stat_Prob").val())/100;
	variance = parseInt($Stat.find(".Stat_Var").val())/100;

	AddLog("Roll "+$Stat.find(".Stat_ID").text()+" "+Math.round(Gaussian(average, variance)*100));
}



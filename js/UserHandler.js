
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
		//Beat=true;
	}
	else
	{
		Warn("Unhandled Msg [" + msg + "]");
	}
}
function OnConnect()
{
	UserLog("Connected to server!", "green");
}
function OnDisconnect()
{
	UserLog("Warning:: Connection to Server Lost", "red");
}
InitConnection(ProcessMessage, OnConnect, OnDisconnect, false);

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
	"Strength": ["Roll", 5.0, 3.0],
	"Dexterity": ["Roll", 5.0, 3.0],
	"Intelligence": ["Roll", 5.0, 3.0],
	"Observation": ["Roll", 5.0, 3.0],
	"Wisdom": ["Roll", 5.0, 3.0],
	"Charisma": ["Roll", 5.0, 3.0],
	"MagicalPower": ["Roll", 5.0, 3.0],
	"MaxHealth": ["Val", 6,0],
	"MaxMana": ["Val", 10,0]
};

ItemStats = {
	"Strength": ["Roll", 5.0, 3.0],
	"Weight": ["Val", 5.0, 3.0],
	"Stealth": ["Val", 5.0, 3.0],
};

GeneralRoll = { "GeneralRoll":["Roll", 5.0, 3.0] };

function AddStats(stats, defaultStats, $location)
{
	stats = ( stats ? stats : defaultStats );

	for (var stat in stats)
	{
		var statData = stats[stat];
		if (statData.length != 3) 
		{ 
			if (defaultStats[stat]) { statData=[defaultStats[stat][0],statData[0],statData[1]]; } 
			else { statData=["Roll",statData[0],statData[1]]; }
		}
		if (statData[1]>10) { statData[1]=statData[1]/10; }
		if (statData[2]>10) { statData[2]=statData[2]/10; }

		var $newElem = $TemplateStat.clone(true);
		$newElem.removeClass("Template");
		
		//Log(statData);
		
		$newElem.find(".Stat_ID").text(stat);
		$newElem.find(".Stat_Type").text(statData[0]);
		$newElem.find(".Stat_Prob").val(statData[1]);
		if (statData[0] == "Roll")
		{
			$newElem.find(".Stat_Var").val(statData[2]);
		}
		else
		{
			$newElem.find(".Stat_Var").remove();
			$newElem.find(".Roll").remove();
		}
		//$newElem.change(ResendCharacterData);
		$location.append($newElem);
	}
}
AddStats(GeneralRoll, GeneralRoll, $(".Log_Column .Stat_Container"));


function InitItem($container, data)
{
	var $newElem = $TemplateItem.clone(true);
	$newElem.removeClass("Template");
	
	var itemID=null;
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
		
		
		
		this.$Root.find(".Character_ID").text(this.CharacterID);

		//Set Saved data
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

		//Add change handler
		this.$Root.change(this, function(event) { ResendCharacterData(event.data.$Root) } );
		
		//Add to DOM
		$CharacterContainer.append(this.$Root);

		ResizeTextarea(this.$Root.find("textarea")[0]);
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
		var label = $(this).find(".Stat_ID").text();
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
		var label = $(this).find(".Stat_ID").text();
		data.Stats[label] = [$(this).find(".Stat_Type").text(), $(this).find(".Stat_Prob").val(), $(this).find(".Stat_Var").val()];
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
	var username = Cookies.get("Username");
	var passHash = Cookies.get("PassHash");
	
	Log("Sending Character Data:");
	Log(data);
	
	var game = "Intro";
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
	var $character = $(this).closest(".Character")
	
	$(this).closest(".Item").remove();
	
	ResendCharacterData($character);
}

$(".Add.Add_Character").click(AddCharacter);
function AddCharacter()
{
	var newCharacter = new Character();
	var data = GetCharacterData(newCharacter.$Root);
	//$character = newCharacter.$Root;
	
	//id = $character.find("Character_ID").text();
	var username = Cookies.get("Username");
	var passHash = Cookies.get("PassHash");
	var game = "Intro";
	MsgSrv({ Msg:"AddCharacter", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":data.CharacterID, Data:JSON.stringify(data) });
}

$(".Del.Del_Character").click(DelCharacter);
function DelCharacter(event)
{
	var $character = $(this).closest(".Character")
	var data = GetCharacterData($character);
	
	//id = $character.find("Character_ID").text();
	var username = Cookies.get("Username");
	var passHash = Cookies.get("PassHash");
	var game = "Intro";
	MsgSrv({ Msg:"DeleteCharacter", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":data.CharacterID });
	
	$character.remove();
}


function RequestCharacter(game)
{
	var username = Cookies.get("Username");
	var passHash = Cookies.get("PassHash");
	MsgSrv({ Msg:"GetCharacter", "Username":username, "PassHash":passHash, "Game":game });
}

/*function RequestCharacterData(game, name)
{
	var username=Cookies.get("Username");
	var passHash=Cookies.get("PassHash");
	MsgSrv({Msg:"GetCharacterData", "Username":username, "PassHash":passHash, "Game":game, "CharacterID":name});
}*/

RequestCharacter("Intro");


$(".Roll").click(Roll);
function Roll(event)
{
	var $Stat = $(this).closest(".Stat");
	var average = parseFloat($Stat.find(".Stat_Prob").val());
	var variance = parseFloat($Stat.find(".Stat_Var").val());

	var roll = CalcRoll(average, variance);
	UserLog("Roll "+$Stat.find(".Stat_ID").text()+" "+roll);
}

$("textarea").on("input",function(event) {
	ResizeTextarea(this);
});

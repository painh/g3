var TILE_WIDTH  = 40;
var TILE_HEIGHT = 40;

var g_cameraX = 0;
var g_cameraY = 0;

var BLOCK_DISTANCE = 33;


var g_coin = 10;
var g_distance = 0;
var g_myTeamMinPos = 11;

function removeFromList(list, obj)
{
//	var newArr = []
//	for(var i in list)
//		if(list[i] != obj)
//			newArr.push(obj);
//
//	list = newArr;
//	return;
	var idx = list.indexOf(obj);
	list.splice(idx, 1); 
}

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();
//-----------------------------------------------------------------------------------------------------

g_objList = new ObjManager();

var g_imgs = [];
var g_pickedObj = null;
var SceneIngame = function()
{ 
	this.Start = function()
	{

//		g_gameUI.Add(240, 30, 64, 32, '위로', this, "goUp");
//		g_gameUI.Add(240, 70, 64, 32, '아래로', this, "goDown");
//		g_gameUI.Add(240, 200, 64, 32, '앞으로', this, "goNext");
//
		var d = new Date();
		var n = d.getTime(); 

		this.turnTime = 0;
		this.state = 'title';
		this.title_cnt = 5; 
		this.title_timer = n;

		g_objList.Clear();
		for(var i = 0; i < 21; ++i)
			g_objList.Add(3, 0, 5, i, i, randomRange(0, 2));
	}
	
	this.End = function()
	{
	} 
	
	this.Update = function()
	{ 
		if(this.state =='gameOver')
			return;

		if(this.state == 'title')
		{
			var d = new Date();
			var n = d.getTime(); 

			if(n - this.title_timer > 1000)
			{
				this.title_timer = n;
				this.title_cnt--;

				if(this.title_cnt == 0)
					this.state = 'game';
			}

			return;
		}

		g_myTeamMinPos = g_objList.Update(g_myTeamMinPos);

		g_effectManager.Update();

		g_gameUI.Update();

		if(MouseManager.LDown != true)
		{
			if(g_pickedObj != null)
			{
				g_objList.ClearPickedObj();
				g_pickedObj = null;
			}
		}
		else
		{
			if(g_pickedObj)
			{ 
				var tiledX = parseInt(MouseManager.x / TILE_WIDTH);
				var tiledY = parseInt(MouseManager.y / TILE_HEIGHT);
				var position = -1;
				for(var i in objPosTable)
				{
					if(objPosTable[i][0] == tiledX && objPosTable[i][1] == tiledY)
						position = i; 
				}

				if(position == -1)
					return;

				if(position <  14)
					return; 

				if(position >  g_objList.GetLastScreenPos())
					return; 

				if(position <  g_myTeamMinPos)
					return; 

				if(position == g_pickedObj.screenPos)
					return;

				g_objList.MovePosition(g_pickedObj, position);

				return;
			}
		}

		if(MouseManager.Clicked)
		{
			var chr = g_objList.GetChrFromScreenPos(MouseManager.x, MouseManager.y);
			if(!chr)
				return; 
		
			if(chr.screenPos <  14)
				return; 

			if(chr.screenPos > g_objList.GetLastScreenPos())
				return; 

			if(chr.screenPos < g_myTeamMinPos)
				return;

			g_pickedObj = g_objList.PickChar(chr);
			console.log('picked! global picked obj');
			console.log(g_pickedObj);

			return;
		} 

		var d = new Date();
		var n = d.getTime(); 

		if(n - this.turnTime > 1000)
		{
			this.turnTime = n;
			console.log('g_myTeamMinPos ' + g_myTeamMinPos);
			var enemy = g_objList.GetObjByPos(g_myTeamMinPos - 1);
			var player = g_objList.GetObjByPos(g_myTeamMinPos);
		
			if(enemy.type == player.type)
			{
				console.log('draw');
				//draw
				enemy.Tie();
				player.Tie();
			}
			else if(enemy.type - player.type == 1 || (enemy.type == 0 && player.type == 2))
			{
				console.log('enemy win');
				enemy.Win();
				player.Lose();
			}
			else
			{
				console.log('player win');
				enemy.Lose();
				player.Win();
			}
		}
	}
	
	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#bbbbbb"); 

		var ycnt = Math.abs(g_cameraX) % 2;
		for(var i = 0; i < Renderer.width; i += TILE_WIDTH)
		{
			var cnt = (ycnt%2);
			for(var j = 0; j < Renderer.height; j += TILE_HEIGHT)
			{
				if(cnt % 2)
					Renderer.Rect( i, j, TILE_WIDTH, TILE_HEIGHT);

				++cnt;
			}

			ycnt++;
		}	

		g_objList.Render(); 
		g_gameUI.Render();

		if(g_pickedObj)
		{ 
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor('#000000');
			for(var i = 0; i <  Renderer.width / TILE_WIDTH; ++i)
				for(var j = 0; j <  Renderer.height / TILE_HEIGHT; ++j)
				{
					var flag = false;
					for(var k = 0; k < objPosTable.length; ++k)
					{
						if(objPosTable[k][0] == i && objPosTable[k][1] == j)
						{
							if(k >=  14 && k <= g_objList.GetLastScreenPos())
								flag = true;
						}

					} 

					if(flag == false) Renderer.Rect(i * TILE_WIDTH, j * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
				} 
			g_pickedObj.Render();
		}

		g_effectManager.Render();
		Renderer.SetAlpha(1.0); 
		if(this.state == 'title')
		{
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor("#000000"); 
			Renderer.Rect(0, 0, Renderer.width, Renderer.height);

			Renderer.SetAlpha(1.0); 
			Renderer.SetColor("#ffffff"); 
			Renderer.SetFont('16pt Arial');
			Renderer.Text(100, 200, this.title_cnt + " left"); 
		}

		if(this.state == 'gameOver')
		{
			Renderer.SetAlpha(1); 
			Renderer.SetColor("#ff0000"); 
			Renderer.SetFont('16pt Arial');
			Renderer.Text(24, 150, "Game Over"); 
		}

	} 
};

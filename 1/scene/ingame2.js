var TILE_WIDTH  = 40;
var TILE_HEIGHT = 40;

var g_cameraX = 0;
var g_cameraY = 0;

var BLOCK_DISTANCE = 33;


var g_coin = 10;
var g_distance = 0;
var g_myTeamMinPos = 11;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();
//-----------------------------------------------------------------------------------------------------

g_objList = new ObjManager();

var g_pickedObj = null;
var SceneIngame = function()
{ 
	this.Start = function()
	{
		var d = new Date();
		var n = d.getTime(); 

//		this.state = 'title';
		this.state = 'game';
		this.title_cnt = 5; 
		this.title_timer = n;
		this.world_moving = false;
		this.world_moving_prev_x = 0;
		this.world_moving_prev_y = 0;

	
		g_objList.Clear();
		for(var i = 0; i < 21; ++i)
			g_objList.Add(0, randomRange(-100, 100), randomRange(-100, 100));
		console.log('start!');
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

		g_objList.Update(); 
		g_effectManager.Update(); 
		g_gameUI.Update();

		if(this.world_moving)
		{
			var diff_x = MouseManager.x - this.world_moving_prev_x;
			var diff_y = MouseManager.y - this.world_moving_prev_y;
			this.world_moving_prev_x = MouseManager.x;
			this.world_moving_prev_y = MouseManager.y;

			g_cameraX -= diff_x;
			g_cameraY -= diff_y;
		}

		if(MouseManager.Upped)
		{
			if(g_pickedObj != null)
				g_objList.Add(randomRange(0, 5), randomRange(-100, 100), randomRange(-100, 100));
		}

		if(MouseManager.LDown != true)
		{
			if(g_pickedObj != null)
			{
				g_objList.ClearPickedObj();
				g_pickedObj = null;
			}
			this.world_moving = false;
		}
		else
		{
			if(g_pickedObj)
			{ 
				var tiledX = parseInt(MouseManager.x / TILE_WIDTH);
				var tiledY = parseInt(MouseManager.y / TILE_HEIGHT);
				var position = -1;

				g_pickedObj.x = MouseManager.x + g_cameraX;
				g_pickedObj.y = MouseManager.y + g_cameraY;

				var obj = g_objList.CheckCollision(g_pickedObj);
				if(obj)
				{
					if(obj.r == g_pickedObj.r)
					{
						g_pickedObj.Combine(obj);
					}
					
				}
				return;
			}
		}

		if(MouseManager.Clicked)
		{
			var chr = g_objList.GetChrFromScreenPos(MouseManager.x, MouseManager.y);
			if(!chr)
			{
				this.world_moving = true;
				this.world_moving_prev_x = MouseManager.x;
				this.world_moving_prev_y = MouseManager.y;
				return; 
			}
		
			g_pickedObj = g_objList.PickChar(chr);
			console.log('picked! global picked obj');
			console.log(g_pickedObj);

			return;
		} 
	}
	
	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#bbbbbb"); 

		for(var i =  -(g_cameraX % TILE_WIDTH) - TILE_WIDTH; i < parseInt(Renderer.width) + TILE_WIDTH; i += TILE_WIDTH)
		{
			for(var j =  -(g_cameraY % TILE_HEIGHT) - TILE_HEIGHT; j < parseInt(Renderer.height) + TILE_HEIGHT; j += TILE_HEIGHT)
			{
				if(Math.abs(parseInt((i+g_cameraX) / TILE_WIDTH) % 2) != Math.abs(parseInt((j+g_cameraY) / TILE_HEIGHT) % 2))
					Renderer.Rect( i, j, TILE_WIDTH, TILE_HEIGHT);

//				Renderer.SetColor("#ff0000"); 
//				Renderer.Text( i, j, [parseInt((i+g_cameraX) / TILE_WIDTH) % 2 , Math.abs(parseInt((j+g_cameraY) / TILE_HEIGHT) % 2)]);
			}
		}	

		g_objList.Render(); 
		g_gameUI.Render();

		if(g_pickedObj)
		{ 
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor('#000000');
			g_pickedObj.Render();
		}

		g_effectManager.Render();
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#000000"); 
		Renderer.Text(0, 0, g_cameraX + "," + g_cameraY + "," + this.world_moving);
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

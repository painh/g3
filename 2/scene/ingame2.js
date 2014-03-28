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
		this.world_moving_enable = false; 
		this.score = 0;
		this.turn = 30;
	
		g_objList.Clear();
		for(var i = 0; i < 5; ++i)
				g_objList.RandomGenerate();
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

		if(this.world_moving_enable && this.world_moving)
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
			{
				this.Turn();
			}
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

				var new_x = MouseManager.x + g_cameraX;
				var new_y = MouseManager.y + g_cameraY;

				if(new_x - g_pickedObj.r < 0 || new_x + g_pickedObj.r >= Renderer.width)
					new_x = g_pickedObj.x;

				if(new_y - g_pickedObj.r < 0 || new_y + g_pickedObj.r >= Renderer.height)
					new_y = g_pickedObj.y;

				console.log(new_x);

				g_pickedObj.x = new_x;
				g_pickedObj.y = new_y;

				var ret = g_objList.CheckCollision(g_pickedObj);
				g_pickedObj = ret.pick_obj;
				this.score += ret.score;

				if(ret.smaller_cnt > 0 || ret.larger_cnt > 0)
				{
					console.log(ret);
					this.Turn();
				}

				return;
			}
		}

		if(MouseManager.Clicked)
		{
			var chr = g_objList.GetChrFromScreenPos(MouseManager.x, MouseManager.y);
			if(!chr)
			{
				if(this.world_moving_enable)
				{
					this.world_moving = true;
					this.world_moving_prev_x = MouseManager.x;
					this.world_moving_prev_y = MouseManager.y;
				}
				return; 
			}
		
			g_pickedObj = g_objList.PickChar(chr);
			console.log('picked! global picked obj');
			console.log(g_pickedObj);

			return;
		} 
	}

	this.Turn = function()
	{
		g_objList.RandomGenerate();
		this.turn--;
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
//		Renderer.Text(0, 0, g_cameraX + "," + g_cameraY + "," + this.world_moving);
		Renderer.Text(0, 0, 'score : ' + this.score + " / turn " + this.turn + " / total " + g_objList.total_point);
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

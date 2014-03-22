var objPosTable = [
//					[0,0], [1,0], [2,0], [3,0], [4,0], [5,0],
														[5,1],
					[5,2], [4,2], [3,2], [2,2], [1,2], [0,2],
					[0,3],
					[0,4], [1,4], [2,4], [3,4], [4,4], [5,4],
														[5,5],
					[5,6], [4,6], [3,6], [2,6], [1,6], [0,6],
					[0,7],
					[0,8], [1,8], [2,8], [3,8], [4,8], [5,8],
					[0,9],
					[5,10], [4,10], [3,10], [2,10], [1,10], [0,10],
					[0,11],
					[0,12], [1,12], [2,12], [3,12], [4,12], [5,12],
					[0,13]
					]; 

var Obj = function()
{
	this.screenPos = 0;
	this.x = 0;
	this.y = 0;
	this.hp = 2;
	this.width = 1;
	this.height = 1;

	this.type = 0;

	this.isPlayer = false;
	this.flip = true;
	this.isDead = false;
	this.scaleSize = 0;
	this.scaleState = 'normal';

	this.Picked = function()
	{
		this.picked = true;
		this.scaleSize = 0;
		this.scaleState = 'picked';
	}

	this.Unpicked = function()
	{
		this.picked = false;
		this.scaleState = 'unpicked';
	}

	this.Update = function()
	{
		var scaleUnit = 1.8;

		switch(this.scaleState)
		{
			case 'normal':
				if(this.scaleSize > 0)
				{
					this.scaleSize -= scaleUnit;
					if(this.scaleSize < 0) this.scaleSize = 0;
				} 
				else
				{
					this.scaleSize += scaleUnit;
					if(this.scaleSize > 0) this.scaleSize = 0;
				}

				break;

			case 'unpicked':
				this.scaleSize -= scaleUnit;
				if(this.scaleSize < 0)
				{
					this.scaleSize = 0;
					this.scaleState = 'normal';
				}
				break;

			case 'picked':
				this.scaleSize += scaleUnit;
				if(this.scaleSize > 10)
					this.scaleSize = 10; 
				break;

			case 'tie':
				this.scaleSize -= scaleUnit;
				if(this.scaleSize < -10)
				{
					this.scaleState = 'normal';
					if(this.hp <= 0)
						this.isDead = true;
				}
				break;

			case 'win':
				this.scaleSize += scaleUnit;
				if(this.scaleSize > 10)
					this.scaleState = 'normal';
				break;

			case 'lose':
				this.scaleSize -= scaleUnit;
				if(this.scaleSize < -10)
				{
					this.scaleState = 'normal';
					this.isDead = true;
				}
				break;
		}
	}

	this.Render = function()
	{ 
		Renderer.SetAlpha(1);

//			if(this.flip == false) 
//				Renderer.Img(x, y, img);
//			else
//				Renderer.ImgFlipH(x, y, img);

	
		var bgColor = "#FFA98F";	
		switch(this.type)
		{
			case 0: break;
			case 1: bgColor = '#FF50CF'; break;
			case 2: bgColor = '#79FFCE'; break;
			case 3: bgColor = '#00CDFF'; break;
		}

		Renderer.SetColor(bgColor);
		var x = 0;
		var y = 0;
		if(this.picked)
		{
			Renderer.SetColor(bgColor);
			var x = MouseManager.x - TILE_WIDTH / 2;
			var y = MouseManager.y - TILE_HEIGHT / 2;
		}
		else
		{
			var x = this.x;
			var y = this.y;

			x = objPosTable[this.screenPos][0];
			y = objPosTable[this.screenPos][1];

			x = (x - g_cameraX) * TILE_WIDTH;
			y = (y - g_cameraY) * TILE_HEIGHT;
		}

		Renderer.RoundRect(x - this.scaleSize, y - this.scaleSize, TILE_WIDTH + this.scaleSize * 2, TILE_HEIGHT + this.scaleSize * 2);
		if(this.screenPos < g_myTeamMinPos)
			Renderer.SetColor('#ff0000');
		else
			Renderer.SetColor('#ffffff');

		var textWidth = Renderer.GetTextWidth(this.screenPos);
		Renderer.Text(x + TILE_WIDTH / 2 - textWidth / 2, 
						y + TILE_HEIGHT / 2 - Renderer.GetFontSize() / 2 , this.hp);
		this.x = x/TILE_WIDTH;
		this.y = y/TILE_HEIGHT;
	}

	this.Tie = function()
	{
		this.scaleState = 'tie';
		this.hp -= 1;
	}

	this.Win = function()
	{
		this.scaleState = 'win';
//		this.hp += 1;
	}

	this.Lose = function()
	{
		this.scaleState = 'lose';
//		this.hp -= 1;
		this.hp = 0;
	}
};

var ObjManager = function()
{ 
	this.Clear = function()
	{
		this.m_list = [];
	}

	this.Add = function(hp, x, y, pos, name, type)
	{

		var obj = new Obj();
		
		obj.x = x;
		obj.y = y;
		obj.screenPos = pos;
		obj.name = name;
		obj.type = type;

		var x = objPosTable[obj.screenPos][0];
		var y = objPosTable[obj.screenPos][1];

		x = (x - g_cameraX) * TILE_WIDTH;
		y = (y - g_cameraY) * TILE_HEIGHT;

		obj.x = x/TILE_WIDTH;
		obj.y = y/TILE_HEIGHT;
		this.m_list.push(obj);

		return obj;
	}

	this.Update = function(minPos)
	{
		var deadList = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Update();
			if(item.isDead)
				deadList.push(item);
		}

		for(var i in deadList)
			removeFromList(this.m_list, deadList[i]);

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.isDead)
				console.log('dead alive');
		}

		for(var i in deadList)
		{
			var deadItem  = deadList[i];
			console.log('dead cnt ' + i);
			if(deadItem.screenPos < minPos) //enemy dead
			{
				for(var j in this.m_list)
				{
					var item = this.m_list[j];
					if(item.screenPos < minPos)
						item.screenPos++;
				}
			}

			if(deadItem.screenPos >= minPos) //player dead
			{
				for(var j in this.m_list)
				{
					var item = this.m_list[j];
					if(item.screenPos >= minPos)
						item.screenPos--;
				}

				continue;
			}
		}

		return minPos; 
	}

	this.Render = function()
	{
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Render();
		} 
	}

	this.GetChrFromScreenPos = function(_x, _y)
	{
		var x = parseInt(_x / TILE_WIDTH) + g_cameraX;
		var y = parseInt(_y / TILE_HEIGHT) + g_cameraY;

		return this.GetChrByPos(x, y);
	}

	this.GetChrByPos = function(x,y)
	{ 
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.x == x && item.y == y)
				return item;
		}
		return null;
	}

	this.PickChar = function(chr)
	{
		if(chr.picked == true)
			return;

		for(var i in this.m_list)
		{
			if(this.m_list[i] == chr)
				this.m_list[i].Picked();
			else
				this.m_list[i].Unpicked();
				//chr.picked = false;
		}

		removeFromList(this.m_list, chr);
		this.m_list.push(chr);

		console.log('chr picked');
		console.log(chr);
		return chr;
	} 

	this.ClearPickedObj = function()
	{ 
		for(var i in this.m_list)
			this.m_list[i].Unpicked();
	}

	this.MovePosition = function(pickedObj, newPos)
	{
		for(var i in this.m_list)
		{
			if(this.m_list[i] == pickedObj)
				continue;
			if(this.m_list[i].screenPos > pickedObj.screenPos)
			{
				this.m_list[i].screenPos--;
			}
		}

		for(var i in this.m_list)
		{
			if(this.m_list[i] == pickedObj)
				continue;

			if(this.m_list[i].screenPos >= newPos)
			{
				this.m_list[i].screenPos++;
			}
		}

		console.log('pos changed : ' + g_pickedObj.screenPos + ' -> ' + newPos);
		g_pickedObj.screenPos = newPos; 
	}

	this.GetObjByPos = function(pos)
	{ 
		for(var i in this.m_list)
		{
			if(this.m_list[i].screenPos == pos)
				return this.m_list[i];
		}

		return null;
	} 
	
	this.GetLastScreenPos = function(pos)
	{ 
		var max = 0;
		for(var i in this.m_list)
			if(this.m_list[i].screenPos > max)
				max = this.m_list[i].screenPos;

		return max;
	} 
}; 

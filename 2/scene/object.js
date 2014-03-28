var g_sizeTable = [ {r : 0, c : '#FF50CF'},
					{r : 1, c : '#79FFCE'},
					{r : 2, c : '#AACDFF'},
					{r : 3, c : '#FFCD00'},
					{r : 4, c : '#CCBB88'},
					{r : 5, c : '#8844BB'},
					{r : 6, c : '#FF22AA'},
					{r : 7, c : '#88CC77'},
					{r : 8, c : '#111111'},
					{r : 9, c : '#44FF99'},
					{r : 10, c : '#88DD88'},
					{r : 11, c : '#44BBFF'}, 
					{r : 12, c : '#7799AA'}, 
					{r : 12, c : '#FF33AA'}
				];

var size = 15;
for(var i  in g_sizeTable)
{
	g_sizeTable[i].r = size;
	size += 2;
}
var Obj = function()
{
	this.screenPos = 0;
	this.x = 0;
	this.y = 0;
	this.r = 0;
	this.width = 1;
	this.height = 1;

	this.type = 0;

	this.isPlayer = false;
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
		if(this.scaleState != 'picked')
			return;

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
//				this.scaleSize -= scaleUnit;
//				if(this.scaleSize < 0)
//				{
//					this.scaleSize = 0;
					this.scaleState = 'normal';
//				}
				break;

			case 'picked':
//				this.scaleSize += scaleUnit;
//				if(this.scaleSize > 10)
//					this.scaleSize = 10; 
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

			case 'dead':
				this.scaleSize -= scaleUnit;
				if(this.scaleSize < -10)
				{
					this.scaleState = 'normal';
					this.isDead = true;
				}
				break;
		}

		if(!this.picked)
			return;

	}

	this.Render = function()
	{ 
		Renderer.SetAlpha(1);

//			if(this.flip == false) 
//				Renderer.Img(x, y, img);
//			else
//				Renderer.ImgFlipH(x, y, img);

	
		Renderer.SetColor(this.color);
		var x = this.x - g_cameraX;
		var y = this.y - g_cameraY;

		Renderer.Circle(x, y , this.r * (10 + this.scaleSize) / 10);

		var textWidth = Renderer.GetTextWidth(this.screenPos);
		Renderer.SetColor('#ffffff');
		Renderer.Text(x, y , this.r);
//		Renderer.Text(x + TILE_WIDTH / 2 - textWidth / 2, 
//						y + TILE_HEIGHT / 2 - Renderer.GetFontSize() / 2 , this.hp);
	}

	this.Combine = function(obj)
	{
		obj.isDead = true;
		this.grade++;
		if(this.grade >= g_sizeTable.length)
			this.grade = g_sizeTable.length - 1;
		this.r = g_sizeTable[this.grade].r;
		this.color = g_sizeTable[this.grade].c; 
	}
};

var ObjManager = function()
{ 
	this.total_point = 0;
	this.Clear = function()
	{
		this.m_list = [];
	}

	this.RandomGenerate = function()
	{
		for(var i = 0; i < 5; ++i)
			if(this.Add(randomRange(0, 10), randomRange(0, Renderer.width), randomRange(0, Renderer.height)) !== null)
				return;
	}

	this.Add = function(grade, x, y)
	{
		var obj = new Obj();
		
		obj.x = x;
		obj.y = y;
		obj.grade = grade;
		obj.r = g_sizeTable[grade].r;
		obj.color = g_sizeTable[grade].c;

		var total = 0;
		for(var i in this.m_list)
		{
			var item = this.m_list[i];

			var dx = (item.x - obj.x) * (item.x - obj.x);
			var dy = (item.y - obj.y) * (item.y - obj.y);
			var d = Math.sqrt(dx + dy);


			if(d <= item.r + obj.r)
				return null;

			total += item.r;
		}

		console.log([grade, x, y]);

		this.m_list.push(obj); 
		total +=  grade;
		this.total_point = total;
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
		var x = parseInt(_x) + g_cameraX;
		var y = parseInt(_y) + g_cameraY;

		return this.GetChrByPos(x, y);
	}

	this.CheckCollision = function(obj)
	{ 
		var smaller_list = [];
		var same_list  = [];
		var larger_list  = [];
		var ret = {pick_obj : obj, score : 0,smaller_cnt : 0, same_cnt : 0, larger_cnt : 0};


		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.scaleState == 'dead')
				continue;
			if(item == obj)
				continue;

			var dx = (item.x - obj.x) * (item.x - obj.x);
			var dy = (item.y - obj.y) * (item.y - obj.y);
			var d = Math.sqrt(dx + dy);

			if(d <= item.r + obj.r)
			{
				if(item.r < obj.r)
					smaller_list.push(item);

				if(item.r == obj.r)
					same_list.push(item);

				if(item.r > obj.r)
					larger_list.push(item);
			}
		}

		if(smaller_list.length > 0)
		{
			for(var i in smaller_list)
			{
				smaller_list[i].scaleState = 'dead';
				ret.score -= smaller_list[i].r;
			}
		}
		else if(same_list.length > 0)
		{
			ret.score += same_list[0].r;
			obj.Combine(same_list[0]);
		} else if(larger_list.length > 0)
		{
			this.ClearPickedObj();
			obj.scaleState = 'dead';
			ret.score -= larger_list[0].r;
			ret.pick_obj = null;
		}
		ret.smaller_cnt = smaller_list.length;
		ret.larger_cnt = larger_list.length;
		ret.same_cnt = same_list.length;
		return ret;
	}

	this.GetChrByPos = function(x,y)
	{ 
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			var dx = (item.x - x) * (item.x - x);
			var dy = (item.y - y) * (item.y - y);
			var d = Math.sqrt(dx + dy);

			if(d <= item.r)
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
}; 

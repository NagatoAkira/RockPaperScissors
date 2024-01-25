canvas = document.querySelector("canvas")
ctx = canvas.getContext('2d')

canvas.height = window.innerHeight
canvas.width = window.innerWidth

let rock = new Image()
let scissors = new Image()
let paper = new Image()
let auto = new Image()
let trash = new Image()

rock.src = 'pictures\\rock.png'
scissors.src = 'pictures\\scissors.png'
paper.src = 'pictures\\paper.png'
auto.src = 'pictures\\auto.png'
trash.src = 'pictures\\trash.png'

function game_update(){
	ctx.clearRect(0,0,canvas.width, canvas.height)
	ctx.fillStyle = '#FFFFFF'
	ctx.fillRect(0,0,canvas.width, canvas.height)
}
function distance(x1,y1,x2,y2){
	let vec = {x: x2-x1, y: y2-y1}
	return Math.sqrt(vec.x**2+vec.y**2)
}
function normalize(x1,y1,x2,y2){
	let vec = {x: x2-x1, y: y2-y1}
	let dist = distance(x1,y1,x2,y2)
	return {x:vec.x/dist, y:vec.y/dist}
	
}

class Objects{
	constructor(){
		this.army = {s:{type: 's', army: [], aims:{s:-1,p:1,r:0}},
					 p:{type: 'p', army: [], aims:{s:0,p:-1,r:1}},
					 r:{type: 'r', army: [], aims:{s:1,p:0,r:-1}}}
		this.size = 45
		this.speed = 5
	}
	appendObj(x,y,type){
		for(let o in this.army){
			if(this.army[o].type == type){
				this.army[o].army.push({x:x,y:y,vec:{x:0,y:0},idle:{x:Math.random()*canvas.width,y:Math.random()*canvas.height}})
			}
		}
	}
	drawObj(obj,x,y){
		let s = this.size+15
		switch(obj.type){
			case 's':
				ctx.drawImage(scissors,x,y,s,s)
				return
			case 'p':
				ctx.drawImage(paper,x,y,s,s)
				return
			case 'r':
				ctx.drawImage(rock,x,y,s,s)
				return
		}
	}
	drawArmy(){
		for(let o in this.army){
			let army = this.army[o]
			
			for(let l in army.army){
				let pos = army.army[l]
				this.drawObj(army, pos.x, pos.y)
				//ctx.fillRect(pos.x, pos.y, this.size, this.size)
			}
		}
		
	}
	definePosNeg(){
		for(let o in this.army){
			let army_o = this.army[o]
			for(let l in this.army){
				let army_l = this.army[l]
				if(army_o.type == army_l.type){
					continue
				}


				for(let lo in army_o.army){
					let pos_lo = army_o.army[lo]
					let min = Infinity
					let obj
					for(let ll in army_l.army){
						let pos_ll = army_l.army[ll]
						let dist = distance(pos_lo.x, pos_lo.y, pos_ll.x, pos_ll.y)
						if(min > dist){
							min = dist
							obj = pos_ll
						}
					}
					if(army_o.aims[l]==0){
						pos_lo.neg = obj
						pos_lo.negType = l
					}else{
						pos_lo.pos = obj
						pos_lo.posType = l
					}
				}
			}
		}
	}
	defineVector(){
		for(let o in this.army){
			let army = this.army[o]
			for(let l in army.army){
				let pos = army.army[l]
				
				if(pos.neg == null && pos.pos == null){
					let norm_idle = normalize(pos.x, pos.y, pos.idle.x, pos.idle.y)
					pos.vec.x = norm_idle.x
					pos.vec.y = norm_idle.y
					if(distance(pos.x, pos.y, pos.idle.x, pos.idle.y) < this.size){
						pos.idle.x = Math.random()*canvas.width
						pos.idle.y = Math.random()*canvas.height
					}
					continue
				}

				if(pos.pos != null && pos.neg != null){
					let norm_pos = normalize(pos.x, pos.y, pos.pos.x, pos.pos.y)
					let norm_neg = normalize(pos.x, pos.y, pos.neg.x, pos.neg.y)

					let esc = Math.atan2(-norm_neg.y, -norm_neg.x)
					let lim01 = esc - Math.PI * 0.5
					let lim02 = esc + Math.PI * 0.5
					
					let s = this.size
					/*
					//Detect Enemy
					ctx.fillStyle = "#FFFFFF"
					ctx.fillRect(Math.sin(lim01)*75+pos.x+s/2-s/4, Math.cos(lim01)*75+pos.y+s/2-s/4, s/2, s/2)
					ctx.fillRect(Math.sin(lim02)*75+pos.x+s/2-s/4, Math.cos(lim02)*75+pos.y+s/2-s/4, s/2, s/2)
					*/

					let find_pos = Math.atan2(norm_pos.x, norm_pos.y) 
					if(find_pos>lim01 && find_pos<lim02){
						pos.vec.x = norm_pos.x
						pos.vec.y = norm_pos.y
					}else{
						if(distance(pos.x, pos.y, pos.neg.x, pos.neg.y) < this.size+50){
							pos.vec.x = -norm_neg.x
							pos.vec.y = -norm_neg.y

						}
						/*else{
							pos.idle.x = rand_x*canvas.width
							pos.idle.y = rand_y*canvas.height
						}*/
						
						s = this.size
						if(distance(pos.x+s/2, pos.y+s/2, pos.neg.x+s/2, pos.neg.y+s/2) < s){
							this.army[pos.negType].army.push(pos)
							delete this.army[o].army[l]
						}
					}

					continue
				}


				if(pos.pos != null){
					let norm = normalize(pos.x, pos.y, pos.pos.x, pos.pos.y)
					pos.vec.x = norm.x
					pos.vec.y = norm.y

				}
				/*else{
					pos.idle.x = rand_x*canvas.width
					pos.idle.y = rand_y*canvas.height
				}*/
				

				if(pos.neg != null){
					let norm = normalize(pos.x, pos.y, pos.neg.x, pos.neg.y)
					if(distance(pos.x, pos.y, pos.neg.x, pos.neg.y) < this.size+50){
						pos.vec.x = -norm.x
						pos.vec.y = -norm.y

					}
					/*else{
						pos.idle.x = rand_x*canvas.width
						pos.idle.y = rand_y*canvas.height
					}*/

					let s = this.size
					if(distance(pos.x+s/2, pos.y+s/2, pos.neg.x+s/2, pos.neg.y+s/2) < s){
					this.army[pos.negType].army.push(pos)
					delete this.army[o].army[l]
					}
					continue
				}
				

			}
		}
	}
	moveArmy(){
		let diff = 3
		for(let o in this.army){
			let army = this.army[o]

			for(let l in army.army){
				let pos = army.army[l]
				if(pos.x < 0){
					pos.x = diff 
				}
				if(pos.x+this.size > canvas.width){
					pos.x = canvas.width - this.size - diff 
				}
				if(pos.y < 0){
					pos.y = diff  
				}
				if(pos.y+this.size > canvas.height){
					pos.y = canvas.height - this.size - diff 
				}
				
				if(pos.x > 0 && pos.x+this.size < canvas.width &&
				   pos.y > 0 && pos.y+this.size < canvas.height){
					pos.x += pos.vec.x * this.speed 
					pos.y += pos.vec.y * this.speed 
				}
			}
		}
	}
	draw(){
		this.drawArmy()
	}
	update(){
		this.draw()
		this.definePosNeg()
		this.defineVector()
		this.moveArmy()
		//console.log(this.army)
	}
}

class Panel{
	constructor(objects){
		this.objects = objects

		this.padding = 20
		this.objSize = 90
		this.panel = {rock: {x: this.padding, y: this.padding, unit: 'r'}, 
					  paper: {x: this.padding + (this.objSize + this.padding), y: this.padding, unit: 'p'}, 
					  scissors: {x: this.padding + (this.objSize + this.padding)*2, y: this.padding, unit: 's'},
					  auto: {x: this.padding + (this.objSize + this.padding)*3, y: this.padding, unit: 'a'},
					  trash: {x: canvas.width - (this.objSize + this.padding), y: this.padding, unit: 't'}}
		
		this.curr_obj = null

		this.isAuto = false
		this.doSpawn = false
		
	}
	drawPanel(){
		let size = this.objSize
		let panel = this.panel

		ctx.drawImage(scissors, panel.scissors.x, panel.scissors.y, size, size)
		ctx.drawImage(rock, panel.rock.x, panel.rock.y, size, size)
		ctx.drawImage(paper, panel.paper.x, panel.paper.y, size, size)
		ctx.drawImage(auto, panel.auto.x, panel.auto.y, size, size)
		ctx.drawImage(trash, panel.trash.x, panel.trash.y, size, size)
	}
	drawPicked(){
		ctx.fillStyle = '#000000'

		let size = this.objSize
		if (this.curr_obj != null){
			let obj = this.curr_obj
			ctx.globalAlpha = 0.2
			ctx.fillRect(obj.x+size/2-size*1.2/2, obj.y+size/2-size*1.2/2, size*1.2, size*1.2,)
			ctx.globalAlpha = 1
		}
	}
	autoGen(){
		if(this.curr_obj.unit == 'a'){	
			let Units = ['s','p','r']
			for(let i=0; i<200; i++){
				let x,y,unit;
				x = Math.random()*canvas.width
				y = Math.random()*canvas.height

				unit = Units[Math.floor(Math.random()*3)]

				this.objects.appendObj(x,y,unit)
			}
			this.curr_obj = null
		}
	}
	clear(){
		if(this.curr_obj.unit == 't'){
			for(let obj in this.objects.army){
				obj = this.objects.army[obj]
				obj.army = []
			}
			this.curr_obj = null
		}
	}
	pick(x,y){
		let size = this.objSize
		for (let obj in this.panel){
			obj = this.panel[obj]
			if (distance(x, y, obj.x+size/2, obj.y+size/2) < size/2){
				this.curr_obj = obj
				this.doSpawn = false
				return null
			}
		}
		this.doSpawn = true
	}
	put(x,y){
		if(this.doSpawn && this.curr_obj != null){
			this.objects.appendObj(x,y, this.curr_obj.unit)
		}
	}
	draw(){
		this.drawPicked()
		this.drawPanel()
	}
	update(){
		this.draw()
	}
}

const fps = 60

var objects = new Objects()
var panel = new Panel(objects)


function animate(){
	setTimeout(()=>{
	window.requestAnimationFrame(animate)
	}, 1000/fps)
	game_update()

	objects.update()
	panel.update()
}

onmousedown = (event) => {
	panel.pick(event.clientX, event.clientY)
	if(panel.curr_obj != null){
		panel.autoGen()
		panel.clear()
		panel.put(event.clientX, event.clientY)
	}
};

animate()

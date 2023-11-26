canvas = document.querySelector("canvas")
ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight


function game_update(){
	ctx.clearRect(0,0,canvas.width, canvas.height)
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
		this.size = 50
	}
	appendObj(x,y,type){
		for(let o in this.army){
			if(this.army[o].type == type){
				this.army[o].army.push({x:x,y:y,vec:{x:0,y:0}})
			}
		}
	}
	drawObj(obj){
		switch(obj.type){
			case 's':
				ctx.fillStyle = '#5858db' // blue
				return
			case 'p':
				ctx.fillStyle = '#58db7b' // green
				return
			case 'r':
				ctx.fillStyle = '#db6158' // red
				return
		}
	}
	drawArmy(){
		for(let o in this.army){
			let army = this.army[o]
			this.drawObj(army)
			for(let l in army.army){
				let pos = army.army[l]
				ctx.fillRect(pos.x, pos.y, this.size, this.size)
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

				if(pos.pos != null && pos.neg != null){
					let norm_pos = normalize(pos.x, pos.y, pos.pos.x, pos.pos.y)
					let norm_neg = normalize(pos.x, pos.y, pos.neg.x, pos.neg.y)
					//let dist_pos = distance(pos.x, pos.y, pos.pos.x, pos.pos.y)
					//let dist_neg = distance(pos.x, pos.y, pos.neg.x, pos.neg.y)

					let esc = Math.atan2(-norm_neg.y, -norm_neg.x)
					let lim01 = esc - Math.PI * 0.5
					let lim02 = esc + Math.PI * 0.5
					
					let s = this.size
					ctx.fillStyle = "#FFFFFF"
					ctx.fillRect(Math.sin(lim01)*75+pos.x+s/2-s/4, Math.cos(lim01)*75+pos.y+s/2-s/4, s/2, s/2)
					ctx.fillRect(Math.sin(lim02)*75+pos.x+s/2-s/4, Math.cos(lim02)*75+pos.y+s/2-s/4, s/2, s/2)

					let find_pos = Math.atan2(norm_pos.x, norm_pos.y) 
					if(find_pos>lim01 && find_pos<lim02){
						pos.vec.x = norm_pos.x
						pos.vec.y = norm_pos.y
					}else{
						pos.vec.x = -norm_neg.x
						pos.vec.y = -norm_neg.y

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
				}else{
					pos.vec = {x:0,y:0}
				}
				

				if(pos.neg != null){
					let norm = normalize(pos.x, pos.y, pos.neg.x, pos.neg.y)
					pos.vec.x = -norm.x
					pos.vec.y = -norm.y

					let s = this.size
					if(distance(pos.x+s/2, pos.y+s/2, pos.neg.x+s/2, pos.neg.y+s/2) < s){
					this.army[pos.negType].army.push(pos)
					delete this.army[o].army[l]
					}
				}

			}
		}
	}
	moveArmy(){
		for(let o in this.army){
			let army = this.army[o]

			for(let l in army.army){
				let pos = army.army[l]
				if(pos.x > 0 && pos.x+this.size < canvas.width &&
				   pos.y > 0 && pos.y+this.size < canvas.height){
					pos.x += pos.vec.x
					pos.y += pos.vec.y
				}else{
					pos.x -= 2*pos.vec.x
					pos.y -= 2*pos.vec.y
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

const fps = 60

var objects = new Objects()
objects.appendObj(150,150,'s')
objects.appendObj(550,150,'s')
objects.appendObj(150,450,'p')
objects.appendObj(350,150,'r')
objects.appendObj(450,650,'p')

function animate(){
	setTimeout(()=>{
	window.requestAnimationFrame(animate)
	}, 1000/fps)
	game_update()

	objects.update()
}

animate()

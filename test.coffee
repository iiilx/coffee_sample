background = document.getElementById("layer1")
enemyLayer = document.getElementById("layer2")
playerLayer = document.getElementById("layer3")

start = 20
rate = 2
canvas_width = 300
canvas_height = 300

num_units = 15
unit_radius = 5

all_units=[]

ctx_bg = background.getContext("2d")
ctx_bg.beginPath()
ctx_bg.rect(0,0,canvas_width,canvas_height)
ctx_bg.fillStyle = "black"
ctx_bg.fill()

ctx_p = background.getContext("2d")

class Player
    constructor: (@x,@y,@next_x=@x, @next_y=@y, @frame=0) ->
    animate : ->
        console.log('animating')
        self = @
        setInterval(
            ->
                self.move()
            50
        )
    move : ->
        #console.log('moving')
        #console.log('current: x:' + @x + ', y:' + @y)
        #console.log('next_x:'+@next_x + ', next_y:'+@next_y)
        delta_y = @y - @next_y
        delta_x = @x - @next_x
        #console.log('dx:'+delta_x)
        #console.log('dy:'+delta_y)
        distance = Math.sqrt(delta_y * delta_y + delta_x * delta_x)
        if distance != 0
            #console.log('distnace != 0')
            if rate > distance
                @x = @next_x
                @y = @next_y
            else
                #calculate angle
                theta = Math.acos((@next_x - @x) / distance)
                #console.log('theta:' + theta)
                x_inc = rate * Math.cos(theta)
                y_inc = rate * Math.sin(theta)
                
                @x += x_inc
                if @next_y > @y
                    @y += y_inc
                else
                    @y -= y_inc
                #console.log('x_inc:' + x_inc + '. y_inc:' + y_inc)
        #console.log('next: x:' + @x + ', y:' + @y)
        @frame += 1
        @draw()
    draw : ->
        console.log('drawing')
        ctx_p = playerLayer.getContext("2d")
        ctx_p.clearRect(0, 0, canvas_width, canvas_height)
        ctx_p.beginPath()
        radius = 5
        ctx_p.fillStyle = 'blue'
        ctx_p.arc(@x, @y, radius, 0, Math.PI*2, true)
        ctx_p.closePath()
        ctx_p.fill()
        @frame += 1

player = new Player(25,25)
player.animate()

movePlayer = (e) ->
    e.preventDefault()
    if e.pageX != undefined && e.pageY != undefined
        x = e.pageX
        y = e.pageY
    else
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    x -= playerLayer.offsetLeft
    y -= playerLayer.offsetTop
    console.log('click: x:' + x + ', y:' + y)
    player.next_x = x
    player.next_y = y
    #player.move(x,y)

playerLayer.addEventListener("contextmenu", movePlayer, false)

class Enemy
    constructor: (@x, @y) ->
    frame : 0
    move : ->
        self = @
        setInterval(
            ->
                self.draw()
            50
        )
    draw : ->
        @x += 2
        ctx_e = enemyLayer.getContext("2d")
        ctx_e.clearRect(0, 0, canvas_width, canvas_height)
        ctx_e.beginPath()
        radius = 5
        ctx_e.fillStyle = 'blue'
        ctx_e.arc(@x, @y, radius, 0, Math.PI*2, true)
        ctx_e.closePath()
        ctx_e.fill()
        @frame += 1

#enemy = new Enemy(5,5)
#enemy.move()
#setInterval(
#    ->
#        enemy.move()
#        console.log('moved')
#    50
#)

class Unit
    constructor: (@x, @y) ->
    move: (meters=5) ->
        alert 'moving'

    flash_circle: ->
        console.log('flashing')
        frame=0
        x=@x
        y=@y
        draw_circle = (x, y, radius=unit_radius) ->
            console.log('drawing circle at frame '+ frame)
            ctx_e = enemyLayer.getContext("2d")
            ctx_e.beginPath()
            ctx_e.fillStyle = 'red'
            ctx_e.arc(x, y, radius, 0, Math.PI*2, true)
            ctx_e.closePath()
            ctx_e.fill()
            frame += 1 
        setInterval(
            ->
                console.log(x+', ' + y)
                draw_circle(x,y)
            1000
        )

find_spot = ->
    #given a series of x,y coordinates, find an open spot
    #by picking a spot and 
    console.log('finding spot')
    generate_spot = ->
        x = Math.random()*300
        y = Math.random()*300
        return [x,y]
    x = 0
    y = 0
    while true 
        console.log('in while')
        spot = generate_spot()
        x = spot[0]
        y = spot[1]
        if all_units.length == 0
           break
        count = 0
        for unit in all_units
            #compare distance between generated spot and all spots
            delta_x = x - unit.x
            delta_y = y - unit.y
            delta = Math.sqrt(delta_x * delta_x + delta_y * delta_y)
            if delta > unit_radius * 2
                count += 1
            else
                break #break early to move onto next iteration of while loop
        if count == all_units.length
            console.log('leaving while')
            break
        else
    return [x,y]
    # does x in the while get assigned to x here?

construct_units = ->
    for i in [1..num_units]
        spot = find_spot()
        unit = new Unit spot[0], spot[1]
        unit.flash_circle()
        all_units.push(unit)

construct_units()
#setInterval(construct_units, 500)

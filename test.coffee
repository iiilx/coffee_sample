root = exports ? this

background = document.getElementById("layer1")
enemyLayer = document.getElementById("layer2")
playerLayer = document.getElementById("layer3")

start = 20
player_speed = 4
enemy_speed = 2

enemy_color = "red"
player_color = "blue"

canvas_width = 300
canvas_height = 300

num_units = 10 
unit_radius = 5

all_units=[]

ctx_bg = background.getContext("2d")
ctx_bg.beginPath()
ctx_bg.rect(0,0,canvas_width,canvas_height)
ctx_bg.fillStyle = "black"
ctx_bg.fill()

ctx_p = playerLayer.getContext("2d")
ctx_e = enemyLayer.getContext("2d")

class Being
    constructor: (@x, @y, @speed=2) ->
        @frame = 0
        @next_x = @x
        @next_y = @y
        @buckets = []
        @collision_list = []
    move : ->
        delta_y = @y - @next_y
        delta_x = @x - @next_x
        distance = Math.sqrt(delta_y * delta_y + delta_x * delta_x)
        if distance != 0
            #console.log('distnace != 0')
            if @speed > distance
                @x = @next_x
                @y = @next_y
            else
                #calculate angle
                theta = Math.acos((@next_x - @x) / distance)
                #console.log('theta:' + theta)
                x_inc = @speed * Math.cos(theta)
                y_inc = @speed * Math.sin(theta)
                
                @x += x_inc
                if @next_y > @y
                    @y += y_inc
                else
                    @y -= y_inc
        return distance
        

class Player extends Being
    constructor: ->
        super
        @x_route = [@x]
        @y_route = [@y]
        console.log('constructed player')
    move : ->
        @next_x = @x_route[0]
        @next_y = @y_route[0]
        #console.log('set players next coordinates') 
        distance = super
        if distance == 0 and @x_route.length > 1
            #console.log('players distance is 0')
            @x_route.shift()
            @y_route.shift()
            #console.log('popped off route')

root.player = new Player(55, 59, 4)

class Enemy extends Being
    constructor: ->
        super
        @distance = 0
        @stop = false
    move : ->
        @next_x = root.player.x
        @next_y = root.player.y
        super

find_spot = ->
    #alert('finding spot')
    #given a series of x,y coordinates, find an open spot
    #by picking a spot and 
    #console.log('finding spot')
    generate_spot = ->
        return [Math.random()*(canvas_width - 2 * unit_radius), Math.random()*(canvas_height - 2 * unit_radius)]
    x=0
    y=0
    while true 
        #console.log('in while')
        #alert('in while')
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
                break #out of for loop to move onto next iteration of while loop
        
        if count == all_units.length
            console.log('leaving while')
            break # out of while
    return [x,y]
    # does x in the while get assigned to x here?


        
construct_units = ->
    #alert('created player')
    for i in [1..num_units]
        spot = find_spot()
        #alert('found spot')
        unit = new Enemy(spot[0], spot[1])
        #alert('created enemy')
        all_units.push(unit)
    #alert('created enemies')
    #spot = find_spot()
    frame = 0
    radius = unit_radius
    ctx_e.fillStyle = enemy_color
    # need a function that animates every being. in a setTimeout function, draw every units current position.
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
        #console.log('click: x:' + x + ', y:' + y)
        if e.shiftKey
            root.player.x_route.push(x)
            root.player.y_route.push(y)
        else
            root.player.x_route = [x]
            root.player.y_route = [y]
    playerLayer.addEventListener("contextmenu", movePlayer, false)
    draw_beings = ->
        #console.log('drawing beings')
        ctx_e.clearRect(0, 0, canvas_width, canvas_height)
        frame += 1
        update_buckets()
        #console.log('updatd buckets')
            #register unit into all buckets it's in
            #calculate the corners of each unit and then calculate which buckets eachunit is in
            #set buckets[bucket_id].push(unit)  {1:[unit1, unit4], 2:[unit2, unit5], 3:[unit3]}
        collision = false
        was_collision = false
        #if there's a collision, don't move current unit break out of all_units for loop and move all other units. 
        collision_groups = [] #[ [u1,u2,u3], [u4,u5], [u6,u7] ]  or [ {u1:u1, }, {}, {}]
        for unit in all_units # for each unit, find colliding units. if there are collisions and if the unit is in one of the lists, add the colliding units to it. if any of the colliding units are in it, add the unit and rest of the colliding units to it. if there are no colliding units, dont add anything.
            unit.distance = check_distance(unit, root.player)
            unit.stop = false
            collision_list = []
            for i in unit.buckets
                other_units = root.buckets[i.toString()]
                for other in other_units
                    if other == unit or other in collision_list
                        continue
                    distance = check_distance(unit, other)
                    #console.log('distance:' + distance)
                    if distance < 3 * unit_radius
                        console.log('collision!')
                        collision_list.push(other)
            unit.collision_list = collision_list
            if collision_list.length # if there are any collisions with this unit
                if collision_groups.length
                    found = false
                    for group in collision_groups
                        if unit in group
                            group.concat(collision_list)
                            found = true
                            break
                        else
                            for other in collision_list
                                if other in group
                                    group.push(unit)
                                    for x in collision_list
                                        if x not in group
                                            group.push(x)
                                    found = true
                                    break
                    if not found
                        collision_groups.push([unit].concat(collision_list))
                else
                    collision_groups.push([unit].concat(collision_list))
        collision_groups.sort(compare)
        for group in collision_groups
            group.sort(by_distance)
            console.log('a group')
            console.log(group)
            done = false
            group_copy = group.slice()
            count = 0
            while count != group.length
                count = 0
                if group_copy.length
                    unit = group_copy.shift()
                    if unit.collision_list.length
                        unit.stop = true
                        for other in group_copy
                            i = other.collision_list.indexOf(unit)
                            if i > -1 #remove both units from each others collision list
                                other.collision_list.splice(i, 1)
                                j = unit.collision_list.indexOf(other)
                                unit.collision_list.splice(j, 1)
                        for member in group # check to see if any units in group have a nonempty collision list
                            if member.collision_list.length
                                continue
                            else
                                count += 1
                else
                    break
        for unit in all_units
            if not unit.stop
                unit.move() #finds next x and y coordinates for the unit
            ctx_e.beginPath()
            ctx_e.arc(unit.x, unit.y, radius, 0, Math.PI*2, true)
            ctx_e.closePath()
            ctx_e.fill()
        
            #calculate furthest unit and make it stationary. remove it from the group and  
            #unit.collision_list = collision_list 
        #all_units.sort(compare)
        #console.log(all_units)
        #for unit in all_units
        #    if not collision
        #        for i in unit.buckets
        #            collision = check_collision(unit, i)
        #            console.log('collision detected')
        #            if collision
        #                stopped.push(unit)
        #                ctx_e.beginPath()
        #                ctx_e.arc(unit.x, unit.y, radius, 0, Math.PI*2, true)
        #                ctx_e.closePath()
        #                ctx_e.fill()
        #                break # stop checking the rest of the buckets
        #            else
        #            unit.move() #finds next x and y coordinates for the unit
        #            ctx_e.beginPath()
        #            ctx_e.arc(unit.x, unit.y, radius, 0, Math.PI*2, true)
        #            ctx_e.closePath()
        #            ctx_e.fill()
        #    else
        #        unit.move() #finds next x and y coordinates for the unit
        #        ctx_e.beginPath()
        #        ctx_e.arc(unit.x, unit.y, radius, 0, Math.PI*2, true)
        #        ctx_e.closePath()
        #        ctx_e.fill()
        root.player.move() #finds next x and y coords for player
        ctx_p.clearRect(0, 0, canvas_width, canvas_height)
        ctx_p.fillStyle = player_color
        ctx_p.beginPath()
        ctx_p.arc(root.player.x, root.player.y, radius, 0, Math.PI*2, true)
        ctx_p.closePath()
        ctx_p.fill()
    setInterval(draw_beings, 50)

compare = (group1, group2) ->
    return group2.length - group1.length

by_distance = (u1, u2) ->
    return u1.distance < u2.distance

num_buckets_across = 4
num_buckets = num_buckets_across * num_buckets_across
bucket_width = canvas_width / num_buckets_across

check_collision2 = (unit, i) ->
    other_units = root.buckets[i.toString()]
    #console.log(unit)
    #console.log(other_units)
    collision_list = []
    for other in other_units
        console.log(other)
        if other == unit
            continue
        distance = check_distance(unit, other)
        console.log('distance:' + distance)
        if distance < 2 * unit_radius
            console.log('collision!')
            collision_list.push(other)
    return collision_list

check_collision = (unit, i) ->
    other_units = root.buckets[i.toString()]
    console.log(unit)
    console.log(other_units)
    for other in other_units
        console.log(other)
        if other == unit
            continue
        distance = check_distance(unit, other)
        console.log('distance:' + distance)
        if distance < 3 * unit_radius
            console.log('collision!')
            return true
    return false
            # DEAL WITH BOTH UNITS OR JUST ONE? GIVE THE OTHER UNIT SOME MOMENTUM/PUSH?

check_distance = (unit1, unit2) ->
    if unit1 == unit2
        console.log('same not good')
    #console.log('unit1:' + unit1.x+','+unit1.y)
    #console.log('unit2:' + unit2.x + ',' + unit2.y)
    delta_x = unit1.x - unit2.x
    delta_y = unit1.y - unit2.y
    return Math.sqrt(delta_x * delta_x + delta_y * delta_y)

update_buckets = ->
    root.buckets = {}
    for i in [0..num_buckets-1]
        root.buckets[i.toString()] = []
    #console.log('root.buckets: '+root.buckets)
    #console.log('all_units:' + all_units)
    for unit in all_units
        register(unit)
        #console.log('registered unit')

register = (unit) ->
    bucket_ids = get_buckets(unit)
    #console.log('bucket ids: '+bucket_ids)
    unit.buckets = bucket_ids
    for id in bucket_ids
        #console.log('attempting to push unit to bucket ' + id)
        root.buckets[id.toString()].push(unit)
        #console.log('pushed unit to bucket ' + id)

get_buckets = (unit) ->
    bux = []
    min_x = unit.x - unit_radius
    max_x = unit.x + unit_radius
    min_y = unit.y - unit_radius
    max_y = unit.y + unit_radius
    add_bucket = (x,y) ->
        bucket_id = Math.floor(x / bucket_width) + Math.floor(y / bucket_width) * num_buckets_across
        if bucket_id not in bux
            #console.log('pushing bucket ' + bucket_id)
            bux.push(bucket_id)
    add_bucket(min_x, min_y)
    add_bucket(min_x, max_y)
    add_bucket(max_x, min_y)
    add_bucket(max_x, max_y)
    return bux

construct_units()

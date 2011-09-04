(function() {
  var Being, Enemy, Player, all_units, background, bucket_width, canvas_height, canvas_width, check_collision, check_distance, construct_units, ctx_bg, ctx_e, ctx_p, enemyLayer, enemy_color, enemy_speed, find_spot, get_buckets, num_buckets, num_buckets_across, num_units, playerLayer, player_color, player_speed, register, root, start, unit_radius, update_buckets;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  background = document.getElementById("layer1");
  enemyLayer = document.getElementById("layer2");
  playerLayer = document.getElementById("layer3");
  start = 20;
  player_speed = 4;
  enemy_speed = 2;
  enemy_color = "red";
  player_color = "blue";
  canvas_width = 300;
  canvas_height = 300;
  num_units = 5;
  unit_radius = 5;
  all_units = [];
  ctx_bg = background.getContext("2d");
  ctx_bg.beginPath();
  ctx_bg.rect(0, 0, canvas_width, canvas_height);
  ctx_bg.fillStyle = "black";
  ctx_bg.fill();
  ctx_p = playerLayer.getContext("2d");
  ctx_e = enemyLayer.getContext("2d");
  Being = (function() {
    function Being(x, y, speed) {
      this.x = x;
      this.y = y;
      this.speed = speed != null ? speed : 2;
      this.frame = 0;
      this.next_x = this.x;
      this.next_y = this.y;
      this.buckets = [];
    }
    Being.prototype.move = function() {
      var delta_x, delta_y, distance, theta, x_inc, y_inc;
      delta_y = this.y - this.next_y;
      delta_x = this.x - this.next_x;
      distance = Math.sqrt(delta_y * delta_y + delta_x * delta_x);
      if (distance !== 0) {
        if (this.speed > distance) {
          this.x = this.next_x;
          this.y = this.next_y;
        } else {
          theta = Math.acos((this.next_x - this.x) / distance);
          x_inc = this.speed * Math.cos(theta);
          y_inc = this.speed * Math.sin(theta);
          this.x += x_inc;
          if (this.next_y > this.y) {
            this.y += y_inc;
          } else {
            this.y -= y_inc;
          }
        }
      }
      return distance;
    };
    return Being;
  })();
  Player = (function() {
    __extends(Player, Being);
    function Player() {
      Player.__super__.constructor.apply(this, arguments);
      this.x_route = [this.x];
      this.y_route = [this.y];
      console.log('constructed player');
    }
    Player.prototype.move = function() {
      var distance;
      this.next_x = this.x_route[0];
      this.next_y = this.y_route[0];
      console.log('set players next coordinates');
      distance = Player.__super__.move.apply(this, arguments);
      if (distance === 0 && this.x_route.length > 1) {
        console.log('players distance is 0');
        this.x_route.shift();
        this.y_route.shift();
        return console.log('popped off route');
      }
    };
    return Player;
  })();
  root.player = new Player(55, 59, 4);
  Enemy = (function() {
    __extends(Enemy, Being);
    function Enemy() {
      Enemy.__super__.constructor.apply(this, arguments);
    }
    Enemy.prototype.move = function() {
      this.next_x = root.player.x;
      this.next_y = root.player.y;
      return Enemy.__super__.move.apply(this, arguments);
    };
    return Enemy;
  })();
  find_spot = function() {
    var count, delta, delta_x, delta_y, generate_spot, spot, unit, x, y, _i, _len;
    console.log('finding spot');
    generate_spot = function() {
      return [Math.random() * (canvas_width - 2 * unit_radius), Math.random() * (canvas_height - 2 * unit_radius)];
    };
    x = 0;
    y = 0;
    while (true) {
      console.log('in while');
      spot = generate_spot();
      x = spot[0];
      y = spot[1];
      if (all_units.length === 0) {
        break;
      }
      count = 0;
      for (_i = 0, _len = all_units.length; _i < _len; _i++) {
        unit = all_units[_i];
        delta_x = x - unit.x;
        delta_y = y - unit.y;
        delta = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        if (delta > unit_radius * 2) {
          count += 1;
        } else {
          break;
        }
      }
      if (count === all_units.length) {
        console.log('leaving while');
        break;
      }
    }
    return [x, y];
  };
  construct_units = function() {
    var draw_beings, frame, i, movePlayer, radius, spot, unit;
    for (i = 1; 1 <= num_units ? i <= num_units : i >= num_units; 1 <= num_units ? i++ : i--) {
      spot = find_spot();
      unit = new Enemy(spot[0], spot[1]);
      all_units.push(unit);
    }
    frame = 0;
    radius = unit_radius;
    ctx_e.fillStyle = enemy_color;
    movePlayer = function(e) {
      var x, y;
      e.preventDefault();
      if (e.pageX !== void 0 && e.pageY !== void 0) {
        x = e.pageX;
        y = e.pageY;
      } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      x -= playerLayer.offsetLeft;
      y -= playerLayer.offsetTop;
      console.log('click: x:' + x + ', y:' + y);
      if (e.shiftKey) {
        root.player.x_route.push(x);
        return root.player.y_route.push(y);
      } else {
        root.player.x_route = [x];
        return root.player.y_route = [y];
      }
    };
    playerLayer.addEventListener("contextmenu", movePlayer, false);
    draw_beings = function() {
      var i, unit, _i, _j, _len, _len2, _ref;
      console.log('drawing beings');
      ctx_e.clearRect(0, 0, canvas_width, canvas_height);
      frame += 1;
      update_buckets();
      console.log('updatd buckets');
      for (_i = 0, _len = all_units.length; _i < _len; _i++) {
        unit = all_units[_i];
        _ref = unit.buckets;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          i = _ref[_j];
          check_collision(unit, i);
        }
        unit.move();
        ctx_e.beginPath();
        ctx_e.arc(unit.x, unit.y, radius, 0, Math.PI * 2, true);
        ctx_e.closePath();
        ctx_e.fill();
      }
      root.player.move();
      ctx_p.clearRect(0, 0, canvas_width, canvas_height);
      ctx_p.fillStyle = player_color;
      ctx_p.beginPath();
      ctx_p.arc(root.player.x, root.player.y, radius, 0, Math.PI * 2, true);
      ctx_p.closePath();
      return ctx_p.fill();
    };
    return setInterval(draw_beings, 500);
  };
  num_buckets_across = 4;
  num_buckets = num_buckets_across * num_buckets_across;
  bucket_width = canvas_width / num_buckets_across;
  check_collision = function(unit, i) {
    var distance, other, other_units, _i, _len, _results;
    other_units = root.buckets[i.toString()];
    _results = [];
    for (_i = 0, _len = other_units.length; _i < _len; _i++) {
      other = other_units[_i];
      distance = check_distance(unit, other);
      _results.push(distance < 2 * unit_radius ? console.log('collision!') : void 0);
    }
    return _results;
  };
  check_distance = function(unit1, unit2) {
    var delta_x, delta_y;
    delta_x = unit1.x - unit2.x;
    delta_y = unit1.y - unit2.y;
    return Math.sqrt(delta_x * delta_x + delta_y * delta_y);
  };
  update_buckets = function() {
    var i, unit, _i, _len, _ref, _results;
    root.buckets = {};
    for (i = 0, _ref = num_buckets - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      root.buckets[i.toString()] = [];
    }
    console.log('root.buckets: ' + root.buckets);
    console.log('all_units:' + all_units);
    _results = [];
    for (_i = 0, _len = all_units.length; _i < _len; _i++) {
      unit = all_units[_i];
      register(unit);
      _results.push(console.log('registered unit'));
    }
    return _results;
  };
  register = function(unit) {
    var bucket_ids, id, _i, _len, _results;
    bucket_ids = get_buckets(unit);
    console.log('bucket ids: ' + bucket_ids);
    unit.buckets = bucket_ids;
    _results = [];
    for (_i = 0, _len = bucket_ids.length; _i < _len; _i++) {
      id = bucket_ids[_i];
      console.log('attempting to push unit to bucket ' + id);
      root.buckets[id.toString()].push(unit);
      _results.push(console.log('pushed unit to bucket ' + id));
    }
    return _results;
  };
  get_buckets = function(unit) {
    var add_bucket, bux, max_x, max_y, min_x, min_y;
    bux = [];
    min_x = unit.x - unit_radius;
    max_x = unit.x + unit_radius;
    min_y = unit.y - unit_radius;
    max_y = unit.y + unit_radius;
    add_bucket = function(x, y) {
      var bucket_id;
      bucket_id = Math.floor(x / bucket_width) + Math.floor(y / bucket_width) * num_buckets_across;
      if (__indexOf.call(bux, bucket_id) < 0) {
        console.log('pushing bucket ' + bucket_id);
        return bux.push(bucket_id);
      }
    };
    add_bucket(min_x, min_y);
    add_bucket(min_x, max_y);
    add_bucket(max_x, min_y);
    add_bucket(max_x, max_y);
    return bux;
  };
  construct_units();
}).call(this);

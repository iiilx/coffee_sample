(function() {
  var Being, Player, all_units, background, canvas_height, canvas_width, construct_units, ctx_bg, ctx_e, ctx_p, enemyLayer, enemy_color, enemy_speed, find_spot, movePlayer, num_units, player, playerLayer, player_color, player_speed, start, unit_radius;
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
  num_units = 15;
  unit_radius = 5;
  all_units = [];
  ctx_bg = background.getContext("2d");
  ctx_bg.beginPath();
  ctx_bg.rect(0, 0, canvas_width, canvas_height);
  ctx_bg.fillStyle = "black";
  ctx_bg.fill();
  ctx_p = playerLayer.getContext("2d");
  ctx_e = enemyLayer.getContext("2d");
  Player = (function() {
    function Player(x, y, next_x, next_y, frame) {
      this.x = x;
      this.y = y;
      this.next_x = next_x != null ? next_x : this.x;
      this.next_y = next_y != null ? next_y : this.y;
      this.frame = frame != null ? frame : 0;
    }
    Player.prototype.animate = function() {
      var self;
      console.log('animating');
      self = this;
      return setInterval(function() {
        return self.move();
      }, 50);
    };
    Player.prototype.move = function() {
      var delta_x, delta_y, distance, theta, x_inc, y_inc;
      delta_y = this.y - this.next_y;
      delta_x = this.x - this.next_x;
      distance = Math.sqrt(delta_y * delta_y + delta_x * delta_x);
      if (distance !== 0) {
        if (player_speed > distance) {
          this.x = this.next_x;
          this.y = this.next_y;
        } else {
          theta = Math.acos((this.next_x - this.x) / distance);
          x_inc = player_speed * Math.cos(theta);
          y_inc = player_speed * Math.sin(theta);
          this.x += x_inc;
          if (this.next_y > this.y) {
            this.y += y_inc;
          } else {
            this.y -= y_inc;
          }
        }
      }
      this.frame += 1;
      return this.draw();
    };
    Player.prototype.draw = function() {
      var radius;
      console.log('drawing');
      ctx_p.clearRect(0, 0, canvas_width, canvas_height);
      ctx_p.beginPath();
      radius = 5;
      ctx_p.fillStyle = player_color;
      ctx_p.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
      ctx_p.closePath();
      ctx_p.fill();
      return this.frame += 1;
    };
    return Player;
  })();
  player = new Player(25, 25);
  player.animate();
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
    player.next_x = x;
    return player.next_y = y;
  };
  playerLayer.addEventListener("contextmenu", movePlayer, false);
  Being = (function() {
    function Being(x, y, ctx, next_x, next_y, frame, color) {
      this.x = x;
      this.y = y;
      this.ctx = ctx;
      this.next_x = next_x != null ? next_x : this.x;
      this.next_y = next_y != null ? next_y : this.y;
      this.frame = frame != null ? frame : 0;
      this.color = color != null ? color : 'red';
    }
    Being.prototype.animate = function() {
      var self;
      console.log('animating');
      self = this;
      return setInterval(function() {
        return self.move();
      }, 50);
    };
    Being.prototype.move = function() {
      var delta_x, delta_y, distance, theta, x_inc, y_inc;
      delta_y = this.y - this.next_y;
      delta_x = this.x - this.next_x;
      distance = Math.sqrt(delta_y * delta_y + delta_x * delta_x);
      if (distance !== 0) {
        if (enemy_speed > distance) {
          this.x = this.next_x;
          return this.y = this.next_y;
        } else {
          theta = Math.acos((this.next_x - this.x) / distance);
          x_inc = enemy_speed * Math.cos(theta);
          y_inc = enemy_speed * Math.sin(theta);
          this.x += x_inc;
          if (this.next_y > this.y) {
            return this.y += y_inc;
          } else {
            return this.y -= y_inc;
          }
        }
      }
    };
    return Being;
  })();
  find_spot = function() {
    var count, delta, delta_x, delta_y, generate_spot, spot, unit, x, y, _i, _len;
    console.log('finding spot');
    generate_spot = function() {
      var x, y;
      x = Math.random() * 300;
      y = Math.random() * 300;
      return [x, y];
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
      } else {

      }
    }
    return [x, y];
  };
  construct_units = function() {
    var draw_beings, frame, i, radius, spot, unit;
    for (i = 1; 1 <= num_units ? i <= num_units : i >= num_units; 1 <= num_units ? i++ : i--) {
      spot = find_spot();
      unit = new Being(spot[0], spot[1], ctx_e);
      unit.animate();
      all_units.push(unit);
    }
    frame = 0;
    radius = 5;
    ctx_e.fillStyle = enemy_color;
    draw_beings = function() {
      var unit, _i, _len, _results;
      ctx_e.clearRect(0, 0, canvas_width, canvas_height);
      frame += 1;
      _results = [];
      for (_i = 0, _len = all_units.length; _i < _len; _i++) {
        unit = all_units[_i];
        ctx_e.beginPath();
        ctx_e.arc(unit.x, unit.y, radius, 0, Math.PI * 2, true);
        ctx_e.closePath();
        _results.push(ctx_e.fill());
      }
      return _results;
    };
    return setInterval(draw_beings, 50);
  };
  construct_units();
}).call(this);

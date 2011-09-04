(function() {
  var Enemy, Player, Unit, all_units, background, canvas_height, canvas_width, construct_units, ctx_bg, ctx_p, enemyLayer, find_spot, movePlayer, num_units, player, playerLayer, rate, start, unit_radius;
  background = document.getElementById("layer1");
  enemyLayer = document.getElementById("layer2");
  playerLayer = document.getElementById("layer3");
  start = 20;
  rate = 2;
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
  ctx_p = background.getContext("2d");
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
        if (rate > distance) {
          this.x = this.next_x;
          this.y = this.next_y;
        } else {
          theta = Math.acos((this.next_x - this.x) / distance);
          x_inc = rate * Math.cos(theta);
          y_inc = rate * Math.sin(theta);
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
      ctx_p = playerLayer.getContext("2d");
      ctx_p.clearRect(0, 0, canvas_width, canvas_height);
      ctx_p.beginPath();
      radius = 5;
      ctx_p.fillStyle = 'blue';
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
  Enemy = (function() {
    function Enemy(x, y) {
      this.x = x;
      this.y = y;
    }
    Enemy.prototype.frame = 0;
    Enemy.prototype.move = function() {
      var self;
      self = this;
      return setInterval(function() {
        return self.draw();
      }, 50);
    };
    Enemy.prototype.draw = function() {
      var ctx_e, radius;
      this.x += 2;
      ctx_e = enemyLayer.getContext("2d");
      ctx_e.clearRect(0, 0, canvas_width, canvas_height);
      ctx_e.beginPath();
      radius = 5;
      ctx_e.fillStyle = 'blue';
      ctx_e.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
      ctx_e.closePath();
      ctx_e.fill();
      return this.frame += 1;
    };
    return Enemy;
  })();
  Unit = (function() {
    function Unit(x, y) {
      this.x = x;
      this.y = y;
    }
    Unit.prototype.move = function(meters) {
      if (meters == null) {
        meters = 5;
      }
      return alert('moving');
    };
    Unit.prototype.flash_circle = function() {
      var draw_circle, frame, x, y;
      console.log('flashing');
      frame = 0;
      x = this.x;
      y = this.y;
      draw_circle = function(x, y, radius) {
        var ctx_e;
        if (radius == null) {
          radius = unit_radius;
        }
        console.log('drawing circle at frame ' + frame);
        ctx_e = enemyLayer.getContext("2d");
        ctx_e.beginPath();
        ctx_e.fillStyle = 'red';
        ctx_e.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx_e.closePath();
        ctx_e.fill();
        return frame += 1;
      };
      return setInterval(function() {
        console.log(x + ', ' + y);
        return draw_circle(x, y);
      }, 1000);
    };
    return Unit;
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
    var i, spot, unit, _results;
    _results = [];
    for (i = 1; 1 <= num_units ? i <= num_units : i >= num_units; 1 <= num_units ? i++ : i--) {
      spot = find_spot();
      unit = new Unit(spot[0], spot[1]);
      unit.flash_circle();
      _results.push(all_units.push(unit));
    }
    return _results;
  };
  construct_units();
}).call(this);

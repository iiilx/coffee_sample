(function() {
  var Enemy, Player, Unit, all_units, canvas, canvas_height, canvas_width, construct_units, ctx, draw_square, enemy, f, find_spot, init, movePlayer, num_units, player, rate, start, unit_radius;
  canvas = document.getElementById("canvas");
  start = 20;
  rate = 2;
  canvas_width = 300;
  canvas_height = 300;
  num_units = 15;
  unit_radius = 5;
  all_units = [];
  ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.rect(0, 0, canvas_width, canvas_height);
  ctx.fillStyle = "black";
  ctx.fill();
  f = 0;
  draw_square = function(length) {
    if (length == null) {
      length = 10;
    }
    console.log('drawing sq');
    ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.rect(start, 0, length, length);
    if (f % 2 === 0) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "blue";
    }
    ctx.fill();
    start += length;
    return f += 25;
  };
  init = function() {
    return setInterval(function() {
      draw_square(56, 56);
      return console.log("drew sq");
    }, 1000);
  };
  Player = (function() {
    function Player(x, y) {
      this.x = x;
      this.y = y;
    }
    Player.prototype.next_x = 25;
    Player.prototype.next_y = 25;
    Player.prototype.frame = 0;
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
      console.log('moving');
      console.log('current: x:' + this.x + ', y:' + this.y);
      console.log('next_x:' + this.next_x + ', next_y:' + this.next_y);
      delta_y = this.y - this.next_y;
      delta_x = this.x - this.next_x;
      console.log('dx:' + delta_x);
      console.log('dy:' + delta_y);
      distance = Math.sqrt(delta_y * delta_y + delta_x * delta_x);
      if (distance !== 0) {
        console.log('distnace != 0');
        if (rate > distance) {
          this.x = this.next_x;
          this.y = this.next_y;
        } else {
          theta = Math.acos((this.next_x - this.x) / distance);
          console.log('theta:' + theta);
          x_inc = rate * Math.cos(theta);
          y_inc = rate * Math.sin(theta);
          this.x += x_inc;
          if (this.next_y > this.y) {
            this.y += y_inc;
          } else {
            this.y -= y_inc;
          }
          console.log('x_inc:' + x_inc + '. y_inc:' + y_inc);
        }
      }
      console.log('next: x:' + this.x + ', y:' + this.y);
      return this.draw();
    };
    Player.prototype.move_orig = function(x, y) {
      var delta_x, delta_y, distance, theta, x_inc, y_inc, _results;
      _results = [];
      while (true) {
        if (y === this.y && x === this.x) {
          break;
        }
        console.log('in while');
        delta_y = this.y - y;
        delta_x = this.x - x;
        distance = Math.sqrt(delta_y * delta_y + delta_x * delta_x);
        console.log('current: x:' + this.x + ', y:' + this.y);
        if (rate > distance) {
          this.x = x;
          this.y = y;
        } else {
          theta = Math.acos((x - this.x) / distance);
          console.log('theta:' + theta);
          x_inc = rate * Math.cos(theta);
          y_inc = rate * Math.sin(theta);
          this.x += x_inc;
          if (y > this.y) {
            this.y += y_inc;
          } else {
            this.y -= y_inc;
          }
          console.log('x_inc:' + x_inc + '. y_inc:' + y_inc);
        }
        console.log('next: x:' + this.x + ', y:' + this.y);
        _results.push(this.draw());
      }
      return _results;
    };
    Player.prototype.draw = function() {
      var radius;
      console.log('drawing');
      ctx.clearRect(0, 0, canvas_width, canvas_height);
      ctx = canvas.getContext("2d");
      ctx.beginPath();
      radius = 5;
      ctx.fillStyle = 'blue';
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      return this.frame += 1;
    };
    return Player;
  })();
  player = new Player(25, 25);
  player.animate();
  movePlayer = function(e) {
    var x, y;
    if (e.pageX !== void 0 && e.pageY !== void 0) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    console.log('click: x:' + x + ', y:' + y);
    player.next_x = x;
    return player.next_y = y;
  };
  canvas.addEventListener("click", movePlayer, false);
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
      var radius;
      this.x += 2;
      ctx.clearRect(0, 0, canvas_width, canvas_height);
      ctx = canvas.getContext("2d");
      ctx.beginPath();
      radius = 5;
      ctx.fillStyle = 'blue';
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      return this.frame += 1;
    };
    return Enemy;
  })();
  enemy = new Enemy(5, 5);
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
        if (radius == null) {
          radius = unit_radius;
        }
        console.log('drawing circle at frame ' + frame);
        ctx = canvas.getContext("2d");
        ctx.beginPath();
        if (frame % 2 === 0) {
          ctx.fillStyle = 'red';
        } else {
          ctx.fillStyle = 'blue';
        }
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        return frame += 25;
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
}).call(this);

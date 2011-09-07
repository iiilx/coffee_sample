(function() {
  var Being, Enemy, Player, all_units, background, bucket_width, by_distance, canvas_height, canvas_width, check_collision, check_collision2, check_distance, compare, construct_units, ctx_bg, ctx_e, ctx_p, enemyLayer, enemy_color, enemy_speed, find_spot, get_buckets, num_buckets, num_buckets_across, num_units, playerLayer, player_color, player_speed, register, root, start, unit_radius, update_buckets;
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
  num_units = 10;
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
      this.collision_list = [];
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
      distance = Player.__super__.move.apply(this, arguments);
      if (distance === 0 && this.x_route.length > 1) {
        this.x_route.shift();
        return this.y_route.shift();
      }
    };
    return Player;
  })();
  root.player = new Player(55, 59, 4);
  Enemy = (function() {
    __extends(Enemy, Being);
    function Enemy() {
      Enemy.__super__.constructor.apply(this, arguments);
      this.distance = 0;
      this.stop = false;
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
    generate_spot = function() {
      return [Math.random() * (canvas_width - 2 * unit_radius), Math.random() * (canvas_height - 2 * unit_radius)];
    };
    x = 0;
    y = 0;
    while (true) {
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
      var collision, collision_groups, collision_list, count, distance, done, found, group, group_copy, i, j, member, moving, other, other_units, stopped, unit, was_collision, x, _i, _j, _k, _l, _len, _len10, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref;
      ctx_e.clearRect(0, 0, canvas_width, canvas_height);
      frame += 1;
      update_buckets();
      collision = false;
      was_collision = false;
      stopped = [];
      moving = [];
      collision_groups = [];
      for (_i = 0, _len = all_units.length; _i < _len; _i++) {
        unit = all_units[_i];
        unit.distance = check_distance(unit, root.player);
        unit.stop = false;
        collision_list = [];
        _ref = unit.buckets;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          i = _ref[_j];
          other_units = root.buckets[i.toString()];
          for (_k = 0, _len3 = other_units.length; _k < _len3; _k++) {
            other = other_units[_k];
            if (other === unit || __indexOf.call(collision_list, other) >= 0) {
              continue;
            }
            distance = check_distance(unit, other);
            if (distance < 3 * unit_radius) {
              console.log('collision!');
              collision_list.push(other);
            }
          }
        }
        unit.collision_list = collision_list;
        if (collision_list.length) {
          if (collision_groups.length) {
            found = false;
            for (_l = 0, _len4 = collision_groups.length; _l < _len4; _l++) {
              group = collision_groups[_l];
              if (__indexOf.call(group, unit) >= 0) {
                group.concat(collision_list);
                found = true;
                break;
              } else {
                for (_m = 0, _len5 = collision_list.length; _m < _len5; _m++) {
                  other = collision_list[_m];
                  if (__indexOf.call(group, other) >= 0) {
                    group.push(unit);
                    for (_n = 0, _len6 = collision_list.length; _n < _len6; _n++) {
                      x = collision_list[_n];
                      if (__indexOf.call(group, x) < 0) {
                        group.push(x);
                      }
                    }
                    found = true;
                    break;
                  }
                }
              }
            }
            if (!found) {
              collision_groups.push([unit].concat(collision_list));
            }
          } else {
            collision_groups.push([unit].concat(collision_list));
          }
        }
      }
      collision_groups.sort(compare);
      for (_o = 0, _len7 = collision_groups.length; _o < _len7; _o++) {
        group = collision_groups[_o];
        group.sort(by_distance);
        console.log('a group');
        console.log(group);
        done = false;
        group_copy = group.slice();
        count = 0;
        while (count !== group.length) {
          count = 0;
          if (group_copy.length) {
            unit = group_copy.shift();
            if (unit.collision_list.length) {
              unit.stop = true;
              for (_p = 0, _len8 = group_copy.length; _p < _len8; _p++) {
                other = group_copy[_p];
                i = other.collision_list.indexOf(unit);
                if (i > -1) {
                  other.collision_list.splice(i, 1);
                  j = unit.collision_list.indexOf(other);
                  unit.collision_list.splice(j, 1);
                }
              }
              for (_q = 0, _len9 = group.length; _q < _len9; _q++) {
                member = group[_q];
                if (member.collision_list.length) {
                  continue;
                } else {
                  count += 1;
                }
              }
            }
          } else {
            break;
          }
        }
      }
      for (_r = 0, _len10 = all_units.length; _r < _len10; _r++) {
        unit = all_units[_r];
        if (!unit.stop) {
          unit.move();
        }
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
    return setInterval(draw_beings, 50);
  };
  compare = function(group1, group2) {
    return group2.length - group1.length;
  };
  by_distance = function(u1, u2) {
    return u1.distance < u2.distance;
  };
  num_buckets_across = 4;
  num_buckets = num_buckets_across * num_buckets_across;
  bucket_width = canvas_width / num_buckets_across;
  check_collision2 = function(unit, i) {
    var collision_list, distance, other, other_units, _i, _len;
    other_units = root.buckets[i.toString()];
    collision_list = [];
    for (_i = 0, _len = other_units.length; _i < _len; _i++) {
      other = other_units[_i];
      console.log(other);
      if (other === unit) {
        continue;
      }
      distance = check_distance(unit, other);
      console.log('distance:' + distance);
      if (distance < 2 * unit_radius) {
        console.log('collision!');
        collision_list.push(other);
      }
    }
    return collision_list;
  };
  check_collision = function(unit, i) {
    var distance, other, other_units, _i, _len;
    other_units = root.buckets[i.toString()];
    console.log(unit);
    console.log(other_units);
    for (_i = 0, _len = other_units.length; _i < _len; _i++) {
      other = other_units[_i];
      console.log(other);
      if (other === unit) {
        continue;
      }
      distance = check_distance(unit, other);
      console.log('distance:' + distance);
      if (distance < 3 * unit_radius) {
        console.log('collision!');
        return true;
      }
    }
    return false;
  };
  check_distance = function(unit1, unit2) {
    var delta_x, delta_y;
    if (unit1 === unit2) {
      console.log('same not good');
    }
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
    _results = [];
    for (_i = 0, _len = all_units.length; _i < _len; _i++) {
      unit = all_units[_i];
      _results.push(register(unit));
    }
    return _results;
  };
  register = function(unit) {
    var bucket_ids, id, _i, _len, _results;
    bucket_ids = get_buckets(unit);
    unit.buckets = bucket_ids;
    _results = [];
    for (_i = 0, _len = bucket_ids.length; _i < _len; _i++) {
      id = bucket_ids[_i];
      _results.push(root.buckets[id.toString()].push(unit));
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

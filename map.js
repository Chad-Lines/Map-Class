/**
* A Note on Defaults: 
*   Note that this class, by default, is designed for 32x32 floor tiles, and 16x16 wall tiles. If you are working
*   in different dimensions, you will need to alter various values - specifically in the makeMap method.
* 
* @param {Phaser.Sprite} floor - This should be a Phaser.Sprite object which represents the default floor tiles.
* @param {Phaser.Sprite) wall - This should be a Phaser.Sprite object which represents the default wall tiles. 
*   Note that the wall tiles should be half the size of the floor tiles. For example, if the floor tiles are 
*   32x32, then the wall tiles should be 16x16.
* @param {integer} min_room_size - This specifies the minimum size of the rooms. This is multiplied by the
*   dimensions of the floor tiles.
* @param {integer} max_room_size - This specifies the maximum size of the rooms. This is multiplied by the 
*   dimensions of the floor tiles
* @param (integer} max_room_number - This value is used to specify the maximum number of rooms in the map. Best use is 
*   determined by trial and error. In general, a 600x300px map could have 3-5 rooms comfortably.
*
* The map should be defined in the 'create' function of the main game file as in the following example:
*
*       this.map = new Map('floor', 'wall', 2, 5, 10);
*
* Setting Collision:
*   Collision should be set in the update function of the main game file (as is customary). Walls should be referenced 
*   via dot notation as in the following example:
*
*       game.physics.arcade.collide(this.player, this.map.walls);
*
*
**/

Map = function(floor, wall, min_room_size, max_room_size, max_room_number) {
    
    this.floors = game.add.group();
    this.floor_image = floor;
    
    this.walls = game.add.group();
    this.walls.enableBody = true;
    this.wall_image = wall;

    this.room_min_size = min_room_size;
    this.room_max_size = max_room_size;
    this.max_rooms = max_room_number;
    
    this.lastRoomCenter = {x:0, y:0};
    this.num_rooms = 0;
    this.num_tiles = 0;   
    
    this.makeMap();
}
Map.prototype.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
Map.prototype.Room = function(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;

    var center_x = (this.x1 + this.x2) / 2;
    var center_y = (this.y1 + this.y2) / 2;
    this.center_coords = {x: center_x, y: center_y};    
}
Map.prototype.createFloor = function(x, y) {
    fl = this.floors.create(x, y, this.floor_image);
    game.physics.arcade.enable(fl);
    game.physics.arcade.overlap(fl, this.walls, function(floor, wall) {
        wall.destroy();
    });    
}
Map.prototype.createRoom = function(x1, x2, y1, y2) {
    for (var x = x1; x<x2; x+=16) {
        for (var y = y1; y<y2; y+=16) {
            this.createFloor(x, y);
        }
    }    
}
Map.prototype.createHTunnel = function(x1, x2, y) {
    var min = Math.min(x1, x2);
    var max = Math.max(x1, x2);
    for (var x = min; x<max+8; x+=8) {
        this.createFloor(x, y);
    }    
}
Map.prototype.createVTunnel = function(y1, y2, x) {
    var min = Math.min(y1, y2);
    var max = Math.max(y1, y2);
    for (var y = min; y<max+8; y+=8) {
        this.createFloor(x, y);
    }    
}
Map.prototype.makeMap = function() {
    for (var y=0; y<game.world.height; y+= 16) {
        for (var x=0; x<game.world.width; x+=16) {
            var wall = this.walls.create(x, y, this.wall_image);
            wall.body.immovable = true;
        }
    }

    for (var r=0; r<this.max_rooms; r++) {
        var w = this.getRandom(this.room_min_size, this.room_max_size) * 16;
        var h = this.getRandom(this.room_min_size, this.room_max_size) * 16;

        x = this.getRandom(1, ((game.world.width) / 16) - (w/16 + 1)) * 16;
        y = this.getRandom(1, ((game.world.height) / 16) - (w/16 + 1)) * 16;

        this.createRoom(x, x+w, y, y+h);

        if (this.num_rooms == 0) {                
            //playState.player.x = x + (w/2);
            //playState.player.y = y + (h/2);
        } else {
            var new_x = game.math.snapToFloor(x + (w/2), 16);
            var new_y = game.math.snapToFloor(y + (h/2), 16);

            var prev_x = game.math.snapToFloor(this.lastRoomCoords.x, 16);
            var prev_y = game.math.snapToFloor(this.lastRoomCoords.y, 16);

            this.createHTunnel(prev_x, new_x, prev_y, prev_y);
            this.createVTunnel(prev_y, new_y, new_x);
        }

        this.lastRoomCoords = { x: x + (w/2), y: y + (h/2) };
        this.num_rooms++;
    }
}
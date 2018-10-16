

 // Initial Setup
 var canvas = document.querySelector('canvas');
 var c = canvas.getContext('2d');
 
 canvas.width = innerWidth;
 canvas.height = innerHeight;
 
 
 // Variables
 var mouse = {
     x: innerWidth / 2,
     y: innerHeight / 2 };
 
 
 var colors = [
 '#2185C5',
 '#7ECEFD',
 '#FFF6E5',
 '#FF7F66'];
 
 
 
 // Event Listeners
 addEventListener('mousemove', function (event) {
     mouse.x = event.clientX;
     mouse.y = event.clientY;
 });
 
 addEventListener('resize', function () {
     canvas.width = innerWidth;
     canvas.height = innerHeight;
 
     init();
 });
 
 
 // Utility Functions
 function randomIntFromRange(min, max) {
     return Math.floor(Math.random() * (max - min + 1) + min);
 }
 
 function randomColor(colors) {
     return colors[Math.floor(Math.random() * colors.length)];
 }
 
 
 // Objects
 function Particle(x, y, dx, dy, radius, color) {
     this.x = x;
     this.y = y;
     this.dx = dx;
     this.dy = -dy;
     this.radius = 5;
     this.color = color;
     this.timeToLive = 2;
     this.opacity = 1;
     this.r = 10;
     this.g = 10;
     this.b = randomIntFromRange(150, 250);
 
     this.update = function () {
         if (this.y + this.radius + this.dy > canvas.height) {
             this.dy = -this.dy;
         }
 
         if (this.x + this.radius + this.dx > canvas.width || this.x - this.radius + this.dx < 0) {
             this.dx = -this.dx;
         }
         // this.dy += gravity * this.mass;
         this.x += Math.random() > 0.5 ? dx : -dx;
         this.y += Math.random() > 0.5 ? dy : -dy;
         this.draw();
 
 
         this.timeToLive -= 0.01;
     };
 
     this.draw = function () {
         this.opacity = this.timeToLive / 1;
 
         c.save();
         c.beginPath();
         c.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
         c.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.opacity.toFixed(2) + ')';
         c.fill();
 
         c.closePath();
 
         c.restore();
     };
 }
 
 function Mortar(x, y, dx, dy, radius, color) {var _this = this;
     this.x = x;
     this.y = y;
     this.dx = dx;
     this.dy = dy;
     this.radius = radius;
     this.color = color;
     this.triggered = false;
     this.explosion;
     this.waveOffset = randomIntFromRange(1, 2);
 
     this.update = function (delta) {
         _this.draw();
         _this.ttl -= 1;
 
         _this.dy += 0.11;
         _this.x += _this.dx * Math.sin(delta) * _this.waveOffset;
         _this.y += _this.dy;
 
         if (_this.dy > 0) {
             _this.triggered = true;
         }
     };
 
     this.draw = function () {
         c.beginPath();
         c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
         c.fillStyle = this.color;
         c.fill();
         c.closePath();
     };
 
     this.explode = function (callback) {
         // Create explosion... if particle count == 0, call callback
         if (typeof this.explosion == 'undefined') {
             this.explosion = new Explosion(this);
             this.radius = 0;
         }
         this.explosion.update();
 
         if (this.explosion.particles.length <= 0) {
             callback();
         }
     };
 }
 
 function Explosion(source) {
     this.particles = [];
     this.rings = [];
     this.source = source;
 
     this.init = function () {
         for (var i = 0; i < 12; i++) {
             var v = 7;
             var dx = v;
             var dy = v;
 
             // var hue = (255 / 5) * i;
             // var color = "hsl(" + hue + ", 100%, 50%)";
             this.particles.push(new Particle(this.source.x, this.source.y, dx, dy, 1, 'blue'));
         }
     };
 
     this.init();
 
     this.update = function () {
         for (var i = 0; i < this.particles.length; i++) {
             this.particles[i].update();
 
             // Remove particles from scene one time to live is up
             if (this.particles[i].timeToLive < 0) {
                 this.particles.splice(i, 1);
             }
         }
     };
 }
 
 // Implementation
 var mortars = [];
 
 function init() {
 }
 
 // Animation Loop
 var elapsed = 0;
 var randomInterval = randomIntFromRange(80, 170);
 function animate() {
     requestAnimationFrame(animate);
     c.fillStyle = 'rgba(0,0,0, 0.02)';
     c.fillRect(0, 0, canvas.width, canvas.height);var _loop = function _loop(
 
     i) {
         mortars[i].update(elapsed);
 
         if (mortars[i].triggered === true) {
             mortars[i].explode(function () {
                 mortars.splice(i, 1);
             });
         }};for (var i = 0; i < mortars.length; i++) {_loop(i);
     }
 
     if (elapsed % randomInterval == 0) {
         var x = randomIntFromRange(10, canvas.width - 10);
         var dy = randomIntFromRange(-5, -10);
         mortars.push(new Mortar(x, canvas.height, 2, dy, 3, 'blue'));
         randomInterval = randomIntFromRange(50, 100);
     }
 
     elapsed += 1;
 }
 
 init();
 animate();

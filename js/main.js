/**@type {HTMLCanvasElement} */

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var canvas2 = document.getElementById('canvas2');
var ctx2 = canvas2.getContext('2d');
var width = canvas.width = canvas2.width = 700*1.5;
var height = canvas.height = canvas2.height = 500*1.5;

var canvasBoudingRect = canvas.getBoundingClientRect();

ctx.fillStyle = "#f1f1f1";
ctx.strokeStyle = "#f1f1f1";
ctx2.fillStyle = "violet";
ctx2.strokeStyle = "#aaaaaa";
ctx.lineWidth = 1;
ctx2.lineWidth = 1;

const spaceShipImage = new Image('/assets/spaceship2.svg');
spaceShipImage.src = 'assets/spaceship2.svg';
const shoot = new Audio('assets/shoot.wav');
const bgmusic = new Audio('assets/bgmusic.wav');
const explosion1 = new Audio('assets/gunshot2.mp3');
// const explosion1 = new Audio('assets/explosion1.wav');

var controls = {
    up: false,
    down: false,
    left: false,
    right: false
};

var player = {
    x: width/2,
    y: height/2,
    radius: 40,
    speed: 4,
    dx: 0,
    dy: 0,
    ax: 0,
    ay: 0,
    rotate: 0
}

var score = 0;
var isFiring = false;
var isScreenVibrating = false;
var bulletsIndex = 0;
var stars = [];
var bullets = [];
var enemies = [];
var points = [];

for(let i=0;i<150;i++){
    enemies.push({
        x: Math.random()*width*5-2.5*width,
        y: Math.random()*height*5-2.5*height,
        dx: Math.random()*3-1.5,
        dy: Math.random()*3-1.5,
        level:1,
        angle: Math.random()*Math.PI*2
    });
}

for(let i=0;i<1500;i++){
    stars.push({
        x: Math.random()*width*5-2.5*width,
        y: Math.random()*height*5-2.5*height,
        alpha: Math.random()+0.3,
        radius: Math.random()*2+0.5
    });
}

const drawShip = (x, y, size) => {
    ctx.fillStyle = "white";
    ctx.beginPath();

    ctx.drawImage(spaceShipImage, x-size*1.1/2, y-size/2, size*1.1, size);
    if(isFiring){
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "#"+Math.floor(Math.random()*1224334324).toString(16);  // Change this to any color you want
        ctx.fillRect(x-size*1.1/2, y-size/2, size*1.1, size);

        // Reset blending mode
        ctx.globalCompositeOperation = "source-over";
    }
    ctx.fill();
};


function animateBG(){
    requestAnimationFrame(animateBG);
    ctx2.clearRect(0, 0, width, height);

    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        ctx2.beginPath();
        ctx2.arc(star.x -player.x/20 , star.y - player.y/20, star.radius, 0, Math.PI * 2);
        ctx2.fillStyle = ['white','white','white','purple', 'violet', 'teal'][Math.floor(Math.random()*6)];
        ctx2.globalAlpha = star.alpha;
        ctx2.fill();
        // ctx2.stroke();
    }
    ctx2.globalAlpha = 1;
    for(let i=-30;i<60;i++){
        for(let j=-30;j<60;j++){
            ctx2.beginPath();
            ctx2.rect((i*width/14 - player.x/10),(j*width/14 - player.y/10),width/14,width/14);
            ctx2.strokeStyle = "rgba(100,100,100,0.1)";
            ctx2.stroke();
        }
    }

}

animateBG();

var vibrationTriggerTimeStamp = 0;
// var hasdhfgashdfhsdhfgasdfhshdhfs = new Date().getTime();
function animate(){
    // requestAnimationFrame(animate);

    // if((new Date().getTime() - hasdhfgashdfhsdhfgasdfhshdhfs) % 100 > 60){ return 123 }
    // else{

    ctx.save();
    if(isScreenVibrating || (new Date(new Date().getTime() - vibrationTriggerTimeStamp).getTime()) < 500){
        ctx.translate(Math.random()*8-4, Math.random()*8-4)
    }
    ctx.clearRect(0,0,width,height);

    ctx.save();
    ctx.translate(player.x, player.y)
    ctx.rotate(player.rotate);
    // ctx.beginPath();
    // ctx.arc(width/2,height/2,player.radius,0,Math.PI*2);
    // ctx.rect(-player.radius/2,-player.radius/2,player.radius,player.radius);
    // ctx.fill();

    drawShip(0,0,player.radius);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.restore();


    for(let i=0;i<bullets.length;i++){
        ctx.save();
        ctx.translate(bullets[i].x, bullets[i].y)
        ctx.rotate(bullets[i].angle);
        ctx.rect(-1,-3,2,6);
        ctx.fill();
        ctx.stroke();

        ctx.restore()
    }

    for(let i=0;i<points.length;i++){
        ctx.save();
        ctx.translate(points[i].x - player.x + width/2, points[i].y - player.y + height/2);
        ctx.font = "20px 'Audiowide'";
        ctx.fillStyle = `rgba(255,255,255,${points[i].opacity})`;
        ctx.fillStyle = "lightgreen";
        ctx.fillText(`+${points[i].value}`, 0, 0);
        ctx.restore();
        points[i].y -= 1;
        points[i].opacity -= 0.01;
        if(points[i].opacity < 0){
            points.splice(i,1);
        }
    }

    for(let i=0;i<enemies.length;i++){
        ctx.save();
        ctx.translate(enemies[i].x - player.x + width/2, enemies[i].y - player.y + height/2);
        ctx.rotate(enemies[i].angle);

        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI*2);
        ctx.strokeStyle = "#ddd";
        ctx.stroke();
        ctx.closePath()
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI*1.2);
        ctx.strokeStyle = "lightgreen";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath()
        ctx.rotate(-enemies[i].angle*1.5)
        ctx.arc(0, 0, 20, 0, Math.PI*1);
        ctx.strokeStyle = "teal";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = "#f1f1f1";
        ctx.lineWidth = 1;
        enemies[i].angle += 0.05;
        enemies[i].x += enemies[i].dx;
        enemies[i].y += enemies[i].dy;
    }



    if(controls.up){
        player.ay = -0.5;
    }
    if(controls.down){
        player.ay = 0.5;
    }
    if(controls.left){
        player.ax = -0.5;
    }
    if(controls.right){
        player.ax = 0.5;
    }
    if(!controls.up && !controls.down){
        player.ay = 0;
    }
    if(!controls.left && !controls.right){
        player.ax = 0;
    }
    player.dx += player.ax;
    player.dy += player.ay;

    if(player.dx > player.speed){
        player.dx = player.speed;
    }
    if(player.dx < -player.speed){
        player.dx = -player.speed;
    }
    if(player.dy > player.speed){
        player.dy = player.speed;
    }
    if(player.dy < -player.speed){
        player.dy = -player.speed;
    }
    player.dx *= 0.98;
    player.dy *= 0.98;

    player.x += player.dx;
    player.y += player.dy;


    if(isFiring){
        if(bulletsIndex%7 == 0){
            bullets.push({
                x: player.x,
                y: player.y,
                dx: Math.sin(player.rotate)*15,
                dy: -1*Math.cos(player.rotate)*15,
                angle: player.rotate
            });
            shoot.currentTime = 0;
            shoot.play();
        }
        bulletsIndex++;
    }

    bullets = bullets.filter((bullet, i1)=>{
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if(bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height){
            return false;
        }

        enemies.forEach((e,i)=>{
            if(Math.sqrt( (bullet.x - e.x  + player.x - width/2)**2 + (bullet.y - e.y  + player.y - height/2)**2 ) < 35){
                enemies.splice(i,1);
                bullets.splice(i1,1)
                explosion1.currentTime = 0;
                explosion1.play();
                score+=10*e.level;
                points.push({
                    x: e.x,
                    y: e.y,
                    value: 10,
                    opacity: 1
                });

                vibrationTriggerTimeStamp = new Date().getTime();
            }
        });

        return true;
    });

    // Top Menu For scorebar, health and stuff
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("Score: "+score, 20, 40);


    ctx.restore()
    // }
}
animate()
setInterval(animate, 20);




window.addEventListener('keydown', (e)=>{
    if(e.key == 'ArrowUp'){
        controls.up = true;
    }
    if(e.key == 'ArrowDown'){
        controls.down = true;
    }
    if(e.key == 'ArrowLeft'){
        controls.left = true;
    }
    if(e.key == 'ArrowRight'){
        controls.right = true;
    }
    if(e.key == 'w'){
        controls.up = true;
    }
    if(e.key == 's'){
        controls.down = true;
    }
    if(e.key == 'a'){
        controls.left = true;
    }
    if(e.key == 'd'){
        controls.right = true;
    }

    if(e.key == ' '){
        isFiring = true;
    }
})


window.addEventListener('keyup', (e)=>{
    if(e.key == 'ArrowUp'){
        controls.up = false;
    }
    if(e.key == 'ArrowDown'){
        controls.down = false;
    }
    if(e.key == 'ArrowLeft'){
        controls.left = false;
    }
    if(e.key == 'ArrowRight'){
        controls.right = false;
    }
    if(e.key == 'w'){
        controls.up = false;
    }
    if(e.key == 's'){
        controls.down = false;
    }
    if(e.key == 'a'){
        controls.left = false;
    }
    if(e.key == 'd'){
        controls.right = false;
    }

    if(e.key == ' '){
        isFiring = false;
    }
})

var bafhasdhfgsahf = 0;
window.addEventListener('mousemove',(e)=>{
    console.log(e.y-player.y - canvasBoudingRect.y, e.x-player.x - canvasBoudingRect.x)
    // var a = Math.atan2(e.x-width/2, e.y-height/2);
    // console.log(e.y- (player.y + window.innerWidth/2-width/2), e.x- (player.x + window.innerHeight/2 - height/2))
    var a = Math.atan2(e.y-player.y - canvasBoudingRect.y/2, e.x-player.x - canvasBoudingRect.x/2);
    player.rotate = a - Math.PI/2;
})

window.addEventListener('mousedown', (e)=>{
    isFiring = true;
    if(bafhasdhfgsahf==0){
        bafhasdhfgsahf++;
        bgmusic.currentTime = 0;
        bgmusic.play();
        setInterval(()=>{
            bgmusic.currentTime = 0;
            bgmusic.play();
        }, 60000)
    }
})

window.addEventListener('mouseup', (e)=>{
    isFiring = false;
})


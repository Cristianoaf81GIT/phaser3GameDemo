import Phaser from 'phaser';
import mapPNG from './assets/assetsmap.png'
import mapJSON from './assets/map.json';
import water from './assets/water.png';
import playerPNG from './assets/player5.png';
import enemyPNG from './assets/slime.png';
import Enemies from './Enemies';

class MyGame extends Phaser.Scene
{
    player = undefined;
    enemies = undefined;
    enemiesGroup = undefined;
    cursors = undefined;
    backgroundMusic = undefined;
    backgroundImage = undefined;

    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('background', water); // carrega o background        

        this.load.image('tiles', mapPNG);       
        this.load.tilemapTiledJSON('map', mapJSON);
        this.load.spritesheet('player', playerPNG, {frameWidth: 32, frameHeight: 60}); // carrega a sprite do player       
        this.load.image('slime', enemyPNG);
        this.load.audio('music', ['./src/assets/music.ogg']);
    }
      
    create ()
    {
        this.backgroundImage = this.add.image(650,650, 'background'); // adiciona o background nao faz parte do map
        const map = this.make.tilemap({key: 'map'});
        const tileSet = map.addTilesetImage('assets', 'tiles');
        const ground = map.createLayer('ground', tileSet,0,0);   
        const objectCollider = map.createLayer('objectCollider', tileSet,0,0);
        const aboveObject = map.createLayer('aboveObject', tileSet,0,0);
       
        
        objectCollider.setCollisionByProperty({"collider": true});
        objectCollider.forEachTile(tile => {
            tile.baseWidth = 2;
            tile.baseHeight = 20;
            tile.collideDown = true;
            tile.collideLeft = true;
            tile.collideRight = true;
            tile.collideUp = true;
        })

        // objectCollider.setDepth(10);
        aboveObject.setDepth(10);

        // ponto de spawn
        const spawnPoint = map.findObject('player',objects => objects.name === 'spawing point');

        // adiciona o player
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player');// onde a sprite vai ser renderizada
        this.player.body.collideWorldBounds = true;        
        // fisica de colisao entre player objetos do cenario
        this.physics.add.collider(this.player,objectCollider);
        this.physics.add.collider(this.player,this.backgroundImage);

        // adiciona o grupo de inimigos
        // primeiro o nome do objeto do map
        // segundo o nome para o objeto (referência dentro do jogo  )
        this.enemies = map.createFromObjects('enemy',{name: 'enemy'});
        this.enemiesGroup = new Enemies(this.physics.world,this,[], this.enemies);

        // adiciona colisao dos inimigos
        this.physics.add.collider(this.enemiesGroup,this.player,this.hitEnemy,null,this);
        // adiciona colisao com os inimigos
        this.physics.add.collider(this.enemiesGroup, objectCollider);

        // adiciona animacao
        const anims = this.anims;
        
        anims.create({
            key: 'left',
            frames: anims.generateFrameNames('player', {start: 20, end: 21}),
            frameRate: 10,
            repeat: -1            
        });

        anims.create({
            key: 'right',
            frames: anims.generateFrameNames('player', {start: 20, end: 21}),
            frameRate: 10,            
            repeat: -1
        });

        anims.create({
            key: 'front',
            frames: anims.generateFrameNames('player', {start: 0, end: 9}),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: 'back',
            frames: anims.generateFrameNames('player', {start: 11, end: 19 }),
            frameRate: 10,
            repeat: -1
        });
        
        
        // adiciona musica de fundo
        // if (this.sound.context.state === 'suspended')
        //     this.sound.context.resume();
        // this.backgroundMusic = this.sound.add('music',{loop:true,volume:0.6
        // });
        // this.backgroundMusic.play(); // toca a musica
        
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0,0, map.widthInPixels, map.heightInPixels);

    }


    update() 
    {
        // clona o estado de velocidade inicial do player
        // deixa o player parado
        this.player.body.setVelocity(0);
        const preVelocity = this.player.body.velocity.clone();
        // obtem eventos de pressionamento de teclas
        this.cursors = this.input.keyboard.createCursorKeys();

        // move o personagem de acordo com a tecla pressionada
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-200); 
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(200);
        } else if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(200);
        } else {
            this.player.body.setVelocity(0);
        }

        // modifica a animação de sprite do player de acordo com tecla pressionada
        if (this.cursors.left.isDown) {
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.anims.play('right', true);
        } else if (this.cursors.up.isDown) {
            this.player.anims.play('back', true);
        } else if (this.cursors.down.isDown) {
            this.player.anims.play('front', true);
        } else {
            // quando o player estiver parado para a animacao
            // e define a textura em cada velocidade
            this.player.anims.stop();
            this.player.body.setVelocity(0);
            // if(preVelocity.x < 0) {
            //     this.player.setTexture('player', 'left');
            //     this.player.body.setVelocity(0);
            // } else if (preVelocity.x > 0) {
            //     this.player.setTexture('player', 'right');
            //     this.player.body.setVelocity(0);
            // } else if (preVelocity.y < 0) {
            //     this.player.setTexture('player', 'back');
            //     this.player.body.setVelocity(0);
            // } else if (preVelocity.y > 0) {
            //     this.player.setTexture('player', 'front');
            //     this.player.body.setVelocity(0);
            // }
        }          
        
    }

    hitEnemy(player, enemyGroup)
    {
        this.scene.restart();
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 550,
    height: 550,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },            
    scene: MyGame,
};

const game = new Phaser.Game(config);

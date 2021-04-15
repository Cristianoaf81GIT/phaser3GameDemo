import Enemy from './Enemy';


export default class Enemies extends Phaser.Physics.Arcade.Group {
    constructor(world, scene, children, spriteArray) {
        super(world, scene, children, {});
        this.scene = scene;
        this.createEnemies(scene, spriteArray);
    }

    createEnemies(scene, spriteArray) {
        spriteArray.forEach(sprite => {
            // criando um inimigo
            const enemy = new Enemy(scene, sprite.x, sprite.y);
            // area de colisao do inimigo
            enemy.setSize(enemy.width,enemy.height);
            // adicionando o inimigo criado ao grupo
            this.add(enemy);
            // destruindo a sprite
            sprite.destroy();
        });
    }
}
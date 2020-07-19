import Enemy from './enemy.js';

export default class Tank extends Enemy {
  constructor(path, unit) {
    super(path, unit);
    this.speed = 15;
    this.currentSpeed = this.speed;

    this.maxHealth = 500;
    this.health = this.maxHealth;
    this.money = 150;
    this.armor = 30;

    this.colorBase = "#0C090D";
    this.color = "#7EA16B";
  }
}
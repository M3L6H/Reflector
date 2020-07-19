import Enemy from './enemy.js';

export default class Speeder extends Enemy {
  constructor(path, unit) {
    super(path, unit);
    this.speed = 90;
    this.currentSpeed = this.speed;

    this.maxHealth = 200;
    this.health = this.maxHealth;
    this.money = 12;
    this.armor = 0;

    this.colorBase = "#0C090D";
    this.color = "#F9C22E";
  }
}
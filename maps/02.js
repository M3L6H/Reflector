/* Tile key
 * 0b00000:  0 - Empty space
 * 0b00001:  1 - Blank tile
 * 0b00010:  2 - Upward reflector
 * 0b00100:  4 - Rightward reflector
 * 0b01000:  8 - Downward reflector
 * 0b10000: 16 - Leftward reflector
 * 0b00110:  6 - Up Right
 * 0b01010: 10 - Up Down
 * 0b10010: 18 - Up Left
 * 0b01100: 12 - Right Down
 * 0b10100: 20 - Right Left
 * 0b11000: 24 - Down Left
 * 0b01110: 14 - Up Right Down
 * 0b10110: 22 - Up Right Left
 * 0b11010: 26 - Up Down Left
 * 0b11100: 28 - Right Down Left
 * 0b11110: 30 - Up Right Down Left
 * 0b00011:  3 - Spawner
 * 0b00101:  5 - End
 * 0b11101: 29 - Obstacle
 * 0b11111: 31 - Void
 */

 /* Enemy key
  * 0: Normal
  * 1: Tank
  * 2: Speeder
  */

export default {
  map: [
    [0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b01000, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111],
    [0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11101, 0b00001, 0b00001, 0b11101, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111],
    [0b00101, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b11111, 0b11111, 0b11111, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00011],
    [0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b00000, 0b11111, 0b11111, 0b11111, 0b11111, 0b00000, 0b10000, 0b11101, 0b11101, 0b01010, 0b01010, 0b11101, 0b11101],
    [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00010, 0b11101, 0b11101, 0b00100, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
    [0b00000, 0b00110, 0b11111, 0b11111, 0b11111, 0b00000, 0b10010, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b11111, 0b11111, 0b11111, 0b11101, 0b00000],
    [0b00000, 0b00100, 0b11111, 0b11111, 0b11111, 0b00000, 0b11101, 0b11101, 0b11101, 0b11101, 0b11101, 0b11101, 0b11101, 0b11101, 0b00000, 0b11111, 0b11111, 0b11111, 0b11101, 0b00000],
    [0b00000, 0b11101, 0b11111, 0b11111, 0b11111, 0b00000, 0b11101, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11101, 0b00000, 0b11111, 0b11111, 0b11111, 0b10000, 0b00000],
    [0b00000, 0b11101, 0b11111, 0b11111, 0b11111, 0b00000, 0b11000, 0b11101, 0b11101, 0b11101, 0b11101, 0b11101, 0b11101, 0b01100, 0b00000, 0b11111, 0b11111, 0b11111, 0b10000, 0b00000],
    [0b00011, 0b11101, 0b11111, 0b11111, 0b11111, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b11111, 0b11111, 0b11101, 0b00101],
    [0b11111, 0b11101, 0b00001, 0b00001, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b00001, 0b00001, 0b11101, 0b11111],
    [0b11111, 0b11101, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b00010, 0b00010, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11101, 0b11111]
  ],
  paths: {
    "19, 2": [[19, 2], [18, 2], [17, 2], [16, 2], [15, 2], [14, 2], [13, 2], [12, 2], [12, 3], [12, 4], [12, 5], [11, 5], [10, 5], [9, 5], [8, 5], [7, 5], [7, 4], [7, 3], [7, 2], [6, 2], [5, 2], [4, 2], [3, 2], [2, 2], [1, 2], [0, 2]],
    "0, 9": [[0, 9], [0, 8], [0, 7], [0, 6], [0, 5], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [14, 8], [14, 7], [14, 6], [14, 5], [14, 4], [15, 4], [16, 4], [17, 4], [18, 4], [19, 4], [19, 5], [19, 6], [19, 7], [19, 8], [19, 9]]
  },
  health: 5,
  money: 100,
  enemies: {
    1000000000: ["0, 9", 2]
  }
};

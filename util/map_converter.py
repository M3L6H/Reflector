from PIL import Image
import sys, getopt
import math

conversion = {
  "255,255,255,255": "0b00000",
  "56,56,73,255": "0b00001",
  "0,255,0,255": "0b00011",
  "255,52,57,255": "0b00101",
  "0,0,0,255": "0b11111",
  "34,34,34,255": "0b11101"
}

path = "48,0,255,255"

def convert(x, y, pix):
  return ",".join(map(str, pix[x, y]))

def pathSolver(x, y, pix):
  coords = "[" + str(x) + ", " + str(y) + "], "
  output = "[" + coords
  visited = {}
  direction = [0, 0]

  while convert(x * 3, y * 3, pix) != "255,52,57,255":
    if coords in visited:
      x += direction[0]
      y += direction[1]
      coords = "[" + str(x) + ", " + str(y) + "], "
      output += coords
    
    visited[coords] = True

    if convert(x * 3, y * 3 + 1, pix) == path:
      x = x + 1
      direction = [1, 0]
    elif convert(x * 3 + 1, y * 3, pix) == path:
      y = y + 1
      direction = [0, 1]
    elif convert(x * 3 + 2, y * 3 + 1, pix) == path:
      x = x - 1
      direction = [-1, 0]
    else:
      y = y - 1
      direction = [0, -1]
    
    coords = "[" + str(x) + ", " + str(y) + "], "
    output += coords

  output = output.strip(", ")

  output += "]"
  return output

def mapSolver(width, height, pix):
  mapstr = "[\n"
  paths = {}

  for y in range(math.floor(height / 3)):
    mapstr += "\t\t["

    for x in range(math.floor(width / 3)):
      key = convert(x * 3, y * 3, pix)

      if key in conversion:
        mapstr += conversion[key]

        if key == "0,255,0,255":
          paths["\"" + str(x) + ", " + str(y) + "\""] = pathSolver(x, y, pix)
      else:
        mapstr += "0b"

        if convert(x * 3, y * 3 + 1, pix) == "225,221,109,255":
          mapstr += "1"
        else:
          mapstr += "0"

        if convert(x * 3 + 1, y * 3 + 2, pix) == "225,221,109,255":
          mapstr += "1"
        else:
          mapstr += "0"

        if convert(x * 3 + 2, y * 3 + 1, pix) == "225,221,109,255":
          mapstr += "1"
        else:
          mapstr += "0"

        if convert(x * 3 + 1, y * 3, pix) == "225,221,109,255":
          mapstr += "1"
        else:
          mapstr += "0"

        mapstr += "0"

      if x < math.floor(width / 3) - 1:
        mapstr += ", "
      
    mapstr += "]"

    if y < math.floor(height / 3) - 1:
      mapstr += ","

    mapstr += "\n"

  mapstr += "\t]"
  output = "{\n"
  output += "\tmap: " + mapstr + ",\n\tpaths: {\n"
  for key, val in paths.items():
    output += "\t\t" + key + ": " + val + ",\n"

  output = output.strip(", \n")
  output += "\n\t}\n}"
  return output

def main(argv):
  inputfile = argv[0]
  im = Image.open(inputfile)
  pix = im.load()
  print("Image dimensions are", im.size)
  width, height = im.size

  print(mapSolver(width, height, pix))

if __name__ == "__main__":
  main(sys.argv[1:])
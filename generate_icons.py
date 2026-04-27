#!/usr/bin/env python3
"""Generate PNG icons for the Gemini UI Enhancer extension."""
import struct
import zlib
import os

def create_png(width, height, pixels):
    """Create a minimal PNG file from RGBA pixel data."""
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'
    # IHDR
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    # IDAT
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter byte
        for x in range(width):
            idx = (y * width + x) * 4
            raw += bytes(pixels[idx:idx+4])
    idat = chunk(b'IDAT', zlib.compress(raw, 9))
    # IEND
    iend = chunk(b'IEND', b'')
    return sig + ihdr + idat + iend

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def make_icon(size):
    pixels = [0] * (size * size * 4)
    cx, cy = size / 2, size / 2
    corner_r = size * 0.15

    # Colors for gradient
    blue = (96, 165, 250)
    purple = (167, 139, 250)
    pink = (244, 114, 182)
    bg = (10, 14, 26)

    for y in range(size):
        for x in range(size):
            idx = (y * size + x) * 4

            # Check if inside rounded rect
            in_rect = True
            r = corner_r
            # Top-left
            if x < r and y < r:
                if (x - r)**2 + (y - r)**2 > r**2:
                    in_rect = False
            # Top-right
            elif x > size - r - 1 and y < r:
                if (x - (size - r - 1))**2 + (y - r)**2 > r**2:
                    in_rect = False
            # Bottom-left
            elif x < r and y > size - r - 1:
                if (x - r)**2 + (y - (size - r - 1))**2 > r**2:
                    in_rect = False
            # Bottom-right
            elif x > size - r - 1 and y > size - r - 1:
                if (x - (size - r - 1))**2 + (y - (size - r - 1))**2 > r**2:
                    in_rect = False

            if not in_rect:
                pixels[idx:idx+4] = [0, 0, 0, 0]
                continue

            # Check if inside 4-point star
            import math
            dx = x - cx
            dy = y - cy
            angle = math.atan2(dy, dx)
            dist = math.sqrt(dx*dx + dy*dy)

            # 4-point star radius function
            outer = size * 0.38
            inner = size * 0.11
            # Compute star boundary at this angle
            # Star has points at 0, 90, 180, 270 degrees
            a = (angle + math.pi/2) % (math.pi/2)  # normalize to quadrant
            # Interpolate between outer and inner
            t = abs(a - math.pi/4) / (math.pi/4)  # 0 at 45deg, 1 at 0/90deg
            star_r = inner + (outer - inner) * (t ** 0.6)

            if dist <= star_r:
                # Gradient color based on position
                gt = (x + y) / (2 * size)
                if gt < 0.5:
                    color = lerp_color(blue, purple, gt * 2)
                else:
                    color = lerp_color(purple, pink, (gt - 0.5) * 2)
                pixels[idx] = color[0]
                pixels[idx+1] = color[1]
                pixels[idx+2] = color[2]
                pixels[idx+3] = 255
            else:
                pixels[idx] = bg[0]
                pixels[idx+1] = bg[1]
                pixels[idx+2] = bg[2]
                pixels[idx+3] = 255

    return create_png(size, size, pixels)

# Generate icons
icons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons')
os.makedirs(icons_dir, exist_ok=True)

for size in [16, 48, 128]:
    png_data = make_icon(size)
    path = os.path.join(icons_dir, f'icon{size}.png')
    with open(path, 'wb') as f:
        f.write(png_data)
    print(f'Created {path} ({len(png_data)} bytes)')

print('Done! All icons generated.')

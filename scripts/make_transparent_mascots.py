import os
import glob
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

def remove_black_background(input_path, output_path, tolerance=28, feather=3):
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)
    
    h, w, _ = arr.shape
    # Calculate luminance/brightness of each pixel
    r, g, b, _ = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    brightness = np.maximum(r, np.maximum(g, b))
    
    # Visited mask for flood fill from edges
    is_bg = np.zeros((h, w), dtype=bool)
    queue = deque()
    
    # Add all border pixels that are dark
    for y in range(h):
        if brightness[y, 0] <= tolerance:
            queue.append((y, 0))
            is_bg[y, 0] = True
        if brightness[y, w - 1] <= tolerance:
            queue.append((y, w - 1))
            is_bg[y, w - 1] = True
            
    for x in range(w):
        if brightness[0, x] <= tolerance:
            queue.append((0, x))
            is_bg[0, x] = True
        if brightness[h - 1, x] <= tolerance:
            queue.append((h - 1, x))
            is_bg[h - 1, x] = True
            
    # 4-connectivity BFS
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not is_bg[ny, nx]:
                if brightness[ny, nx] <= tolerance:
                    is_bg[ny, nx] = True
                    queue.append((ny, nx))
                    
    # Foreground mask
    alpha_mask = (~is_bg).astype(np.uint8) * 255
    mask_img = Image.fromarray(alpha_mask, mode="L")
    
    # Smooth edges with slight Gaussian blur
    if feather > 0:
        mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=feather))
    
    # Unmultiply black glow around edge to prevent dark halos
    final_arr = np.array(img)
    alpha_arr = np.array(mask_img)
    final_arr[:, :, 3] = alpha_arr
    
    out_img = Image.fromarray(final_arr, mode="RGBA")
    out_img.save(output_path, "PNG")
    print(f"Processed: {input_path} -> {output_path}")

def main():
    mascot_dir = "public/mascot"
    files = [
        "t1ger-beast.png",
        "t1ger-eating.png",
        "t1ger-hungry.png",
        "t1ger-meditating.png",
        "t1ger-petted.png",
        "t1ger-sleeping.png",
    ]
    
    for f in files:
        path = os.path.join(mascot_dir, f)
        if os.path.exists(path):
            remove_black_background(path, path, tolerance=32, feather=1.5)

if __name__ == "__main__":
    main()

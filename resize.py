import os
try:
    from PIL import Image
except ImportError:
    import sys
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def make_square(img_path):
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return
        
    img = Image.open(img_path)
    width, height = img.size
    
    if width == height:
        print(f"{img_path} is already square.")
        return
        
    new_size = max(width, height)
    new_img = Image.new("RGBA", (new_size, new_size), (255, 255, 255, 0))
    
    # Calculate position to center the original image
    left = (new_size - width) // 2
    top = (new_size - height) // 2
    
    new_img.paste(img, (left, top))
    new_img.save(img_path)
    print(f"Resized {img_path} to {new_size}x{new_size}")

make_square("./assets/images/android-icon-foreground.png")
make_square("./assets/images/icon.png")

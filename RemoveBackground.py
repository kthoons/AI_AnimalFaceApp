import os
from rembg import remove
from PIL import Image

# 입력 및 출력 폴더 경로 설정
input_folder_path = "images"
output_folder_path = "NoBackgroundImages"

# 출력 폴더가 없으면 생성
if not os.path.exists(output_folder_path):
    os.makedirs(output_folder_path)

# 입력 폴더의 디렉토리 구조를 순회
for root, dirs, files in os.walk(input_folder_path):
    # 각 디렉토리 내의 파일들에 대해
    for file_name in files:
        # 파일이 jpg, jpeg, png 확장자를 가지면
        if file_name.endswith(('.jpg', '.jpeg', '.png')):
            input_file_path = os.path.join(root, file_name)
            
            # 출력 경로 생성
            relative_path = os.path.relpath(root, input_folder_path)
            output_subfolder_path = os.path.join(output_folder_path, relative_path)
            os.makedirs(output_subfolder_path, exist_ok=True)
            output_file_path = os.path.join(output_subfolder_path, file_name)

            # 입력 이미지를 열고 배경 제거 수행
            input_img = Image.open(input_file_path)
            output_img = remove(input_img)

            # 배경이 제거된 이미지를 출력 폴더에 저장
            if output_img.mode == "RGBA":
                output_img = output_img.convert("RGB")  # 이미지 모드를 RGB로 변경
                
            output_img.save(output_file_path)
            print(f"Processed {input_file_path}")

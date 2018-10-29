
from django.http import HttpResponse

# Create your views here.
from django.shortcuts import render
from tools.models import ToolsImage


import cv2
import numpy as np

#
def make_lut_u():
    return np.array([[[i,255-i,0] for i in range(256)]],dtype=np.uint8)

def make_lut_v():
    return np.array([[[0,255-i,i] for i in range(256)]],dtype=np.uint8)

def make_lut_r():
    return np.array([[[0,0,i] for i in range(256)]],dtype=np.uint8)

def make_lut_g():
    return np.array([[[0,i,0] for i in range(256)]],dtype=np.uint8)

def make_lut_b():
    return np.array([[[i,0,0] for i in range(256)]],dtype=np.uint8)


def rgb2yuv(imag_file):
    img_rgb = cv2.imread(imag_file.img.file.name)
    r,g,b = cv2.split(img_rgb)

    img_yuv = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2YUV)
    y, u, v = cv2.split(img_yuv)
    lut_u, lut_v = make_lut_u(), make_lut_v()


    nr = cv2.cvtColor(r, cv2.COLOR_GRAY2BGR)
    ng = cv2.cvtColor(g, cv2.COLOR_GRAY2BGR)
    nb = cv2.cvtColor(b, cv2.COLOR_GRAY2BGR)

    ny = cv2.cvtColor(y, cv2.COLOR_GRAY2BGR)
    nu = cv2.cvtColor(u, cv2.COLOR_GRAY2BGR)
    nv = cv2.cvtColor(v, cv2.COLOR_GRAY2BGR)

    u_mapped = cv2.LUT(nu, lut_u)
    v_mapped = cv2.LUT(nv, lut_v)

    r_mapped = cv2.LUT(nr,make_lut_r())
    g_mapped = cv2.LUT(ng, make_lut_g())
    b_mapped = cv2.LUT(nb, make_lut_b())

    result = np.vstack([np.hstack([img_rgb, ny]), np.hstack([u_mapped, v_mapped]),
                        np.hstack([r_mapped, g_mapped]),np.hstack([b_mapped, b_mapped])])

    combined_image = imag_file.img.storage.base_location+"/cmb.png"

    cv2.imwrite(combined_image, result)
    return "media/cmb.png"


def upload(request):
    return render(request, 'tools/upload.html')


def show(request):
    new_img = ToolsImage(img=request.FILES.get('img'))
    new_img.save()
    content = {
        #'aaa': new_img,
        'aaa':rgb2yuv(new_img),
    }
    return render(request, 'tools/show.html', content)

def index(request):
    return upload(request)
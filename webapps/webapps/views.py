
from django.http import HttpResponse

# Create your views here.
from django.shortcuts import render
from tools.models import ToolsImage


import cv2
import numpy as np


def index(request):
    return render(request, 'webapps/index.html')
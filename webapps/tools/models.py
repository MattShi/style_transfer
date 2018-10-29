from django.db import models

# Create your models here.

from django.db import models

class ToolsImage(models.Model):
    img = models.ImageField(upload_to='upload')

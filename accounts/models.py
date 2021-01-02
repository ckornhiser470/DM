from django.db import models
# from .forms import CreateUserForm
# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.db import models
from django.core import serializers

# Create your models here.


class User(AbstractUser):
    def natural_key(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
            # "last_login": self.last_login.strftime("%H")
        }
    # def serialize(self):
    #     return{
    #         "id": self.id,
    #         "user": self.username,

    #     }

# accounts/admin.py
from django.contrib import admin
from .models import Profile, Messages, Conversations


admin.site.register(Profile)
admin.site.register(Messages)
admin.site.register(Conversations)

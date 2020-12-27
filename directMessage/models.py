# from django.contrib.auth.models import AbstractUser

# from django.db import modelsfrom __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from accounts.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# # Create your models here.


class Profile(models.Model):
    profile = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile', null=True)
    friends = models.ManyToManyField(
        "Profile", related_name='friend_of', blank=True)
    profile_image = models.ImageField(upload_to='profile', blank=True)

    def __str__(self):
        return self.profile.email

    def serialize(self):
        return{
            "id": self.profile.profile.id,
            "profile": self.profile.username,
            "friends": [profile.profile.username for profile in self.friends.all()],
            # "following": [user.username for user in self.following.all()],
            "profile_image": self.profile_image.url
        }

# On save of Custom User, creates a profile for user


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(profile=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Messages(models.Model):
    sender = models.ForeignKey(
        'Profile', on_delete=models.CASCADE, related_name='messages_sent')
    recipient = models.ForeignKey(
        'Profile', on_delete=models.CASCADE, related_name='messages_recieved', null=True)
    message = models.TextField(blank=True)
    date = models.DateTimeField(auto_now_add=True)
    conversation = models.ForeignKey(
        'Conversations', on_delete=models.CASCADE, related_name='group', null=True)

    def serialize(self):
        return{
            'id': self.id,
            'sender': self.sender.profile.username,
            'recipient': self.recipient.profile.username,
            'message': self.message,
            'date': self.date.strftime("%b %-d %Y, %-I:%M %p")
        }

        class Meta:
            ordering = ['-date']

    # def __str__(self):
    #     return self.date


class Conversations(models.Model):
    members = models.ManyToManyField(
        'Profile', related_name='chat', blank=True)

    def serialize(self):
        return{
            'id': self.id,
            'members': [profile.profile.username for user in self.members.all()],
        }


def __str__(self):
    return [profile.profile.username for user in self.members.all()],

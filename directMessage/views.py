from django.shortcuts import render
from django.urls import reverse
from django.conf import settings

import json
from django.http import JsonResponse
from django.core import serializers

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
# from django.contrib.auth.models import User

from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt

from django.forms import ModelForm
from django import forms
from .models import Messages, Conversations
from .models import Profile
from accounts.models import User
# Create your views here.

# Info for home page and other views

all_users = User.objects.all()
data = serializers.serialize('json', all_users, use_natural_foreign_keys=True)
# admin = User.objects.get(username='admin')


class ProfileForm(forms.Form):
    image = forms.ImageField()


@login_required
def index(request):

    current_user = Profile.objects.get(id=request.user.id)
    friends = current_user.friends.all()
    profiles = Profile.objects.all()

    return render(request, "directMessage/index.html", {
        "current_user": current_user,
        # "profiles": profiles,
        "profiles": profiles.exclude(profile=request.user.id),
        "friends": friends
    })

# @ login_required
# def add_friend(request, friend):


@ login_required
def profile(request):
    return render(request, "directMessage/profile.html", {
        "form": ProfileForm(),
    })


@login_required
# Saving uploaded profile picture
def profile_pic(request):
    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES)
        if form.is_valid():
            profile = Profile.objects.get(profile=request.user)
            profile.profile_image = form.cleaned_data['image']
            profile.save()
            return HttpResponseRedirect(reverse("profile"))
    else:
        form = ProfileForm()
        return render(request, "directMessage/profile.html", {
            'form': form,
        })


@ login_required
def dm(request, user):
    user = User.objects.get(username=user)
    user_id = user.id
    this_convo = Conversations.objects.filter(
        members=request.user.id).filter(members=user_id)
    for conv in this_convo:
        convo = conv
        user_messages = Messages.objects.filter(conversation=convo)
    return render(request, "directMessage/dm.html", {
        # 'to':  User.objects.get(username=user),
        'to': Profile.objects.get(profile=user),
        'conv': user_messages
    })


@ login_required
@csrf_exempt
def user_profile(request, user_id):
    prof_user = Profile.objects.get(profile=user_id)
    if request.method == "GET":
        return JsonResponse(prof_user.serialize(), safe=False)
    #  Update profile
    elif request.method == "PUT":
        data = json.loads(request.body)
        friend = data.get("friend")
        new_friend = Profile.objects.get(profile=friend)

        if new_friend in prof_user.friends.all():
            prof_user.friends.remove(new_friend)
            new_friend.friends.remove(prof_user)
            prof_user.save()
            new_friend.save()
        else:
            prof_user.friends.add(new_friend)
            new_friend.friends.add(prof_user)
            prof_user.save()
            new_friend.save()

        return HttpResponse(status=204)

    # Request must be via GET or Put
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


@csrf_exempt
@ login_required
def message(request, username):
    if request.method == "GET":
        this_user = User.objects.get(username=username)
        user_id = this_user.id
        if Conversations.objects.filter(members=request.user.id).filter(members=user_id).exists():
            this_convo = Conversations.objects.filter(
                members=request.user.id).filter(members=user_id)
            for conv in this_convo:
                convo = conv
                user_messages = Messages.objects.filter(conversation=convo)
            return JsonResponse([message.serialize() for message in user_messages], safe=False)
        else:
            new_convo = Conversations.objects.create()
            new_convo.members.add(user_id)
            new_convo.members.add(request.user.id)
            new_convo.save()
            convo = new_convo
            return JsonResponse({"message": "Conversation created!"}, status=201)

    if request.method == "POST":
        data = json.loads(request.body)
        recipient = data.get("recipient")
        user = User.objects.get(username=recipient)
        profile = Profile.objects.get(profile=user)
        get_convo = Conversations.objects.filter(
            members=user.id).filter(members=request.user.id)
        for conversation in get_convo:
            convo = conversation
        message = data.get("message")
        new_message = Messages(
            message=message,
            sender=Profile.objects.get(id=request.user.id),
            recipient=profile,
            conversation=convo
        )
        new_message.save()
        return JsonResponse({"message": "Message sent!"}, status=201)
